// MP4·MOV(ISO BMFF)에서 촬영 위치 등 메타데이터 상자를 지운다.
//
// 웹은 영상을 다시 인코딩하지 않고 원본을 올리므로, 휴대폰이 넣은 촬영 위치(udta의 ©xyz,
// meta의 com.apple.quicktime.location.ISO6709)가 그대로 서버에 남는다. 상자를 잘라 내면
// 뒤쪽 오프셋(stco·co64)을 모두 고쳐야 하므로, 크기는 그대로 두고 상자 이름을 'free'로
// 바꾼 뒤 내용을 0으로 덮는다. 이름만 바꾸면 재생기는 건너뛰지만 좌표 바이트는 파일에 그대로
// 남는다. 'free'는 재생기가 건너뛰는 빈 상자라 재생에는 영향이 없고, 파일 크기도 그대로라
// presigned URL에 서명된 Content-Length와 어긋나지 않는다.

// 메타데이터를 담는 상자. 위치 외에 기기 모델·촬영 시각도 들어 있어 통째로 지운다.
const METADATA_BOXES = new Set(['udta', 'meta']);
// 메타데이터 상자를 찾으러 들어가는 상자. moov 바로 아래와 트랙 단위에 있다.
const CONTAINER_BOXES = new Set(['moov', 'trak']);

const FREE = [0x66, 0x72, 0x65, 0x65]; // 'free'

export interface StripResult {
  // 상자 구조를 끝까지 읽었고 moov가 있었는지. false면 MP4·MOV가 아니거나 깨진 파일이다.
  valid: boolean;
  // 'free'로 바꾼 상자 수
  stripped: number;
}

function boxType(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3]
  );
}

// bytes를 직접 고친다.
export function stripVideoMetadata(bytes: Uint8Array): StripResult {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let stripped = 0;
  let hasMoov = false;

  // [start, end) 구간의 상자를 차례로 읽는다. 구조가 어긋나면 false다.
  const walk = (start: number, end: number, depth: number): boolean => {
    let offset = start;
    while (offset < end) {
      if (offset + 8 > end) return false;
      let size = view.getUint32(offset);
      const type = boxType(bytes, offset + 4);
      let headerSize = 8;
      if (size === 1) {
        // 64비트 크기. 50MiB 상한 안에서는 상위 32비트가 0이다.
        if (offset + 16 > end) return false;
        size =
          view.getUint32(offset + 8) * 2 ** 32 + view.getUint32(offset + 12);
        headerSize = 16;
      } else if (size === 0) {
        // 파일 끝까지 이어지는 상자(최상위 mdat에서만 쓰인다)
        size = end - offset;
      }
      if (size < headerSize || offset + size > end) return false;

      if (depth === 0 && type === 'moov') hasMoov = true;
      if (depth > 0 && METADATA_BOXES.has(type)) {
        bytes.set(FREE, offset + 4);
        bytes.fill(0, offset + headerSize, offset + size);
        stripped += 1;
      } else if (CONTAINER_BOXES.has(type)) {
        if (!walk(offset + headerSize, offset + size, depth + 1)) return false;
      }
      offset += size;
    }
    return true;
  };

  const parsed = walk(0, bytes.byteLength, 0);
  return { valid: parsed && hasMoov, stripped };
}
