// S:ote 악기 캐릭터 이미지
import pianoImage from 'figma:asset/a81f84aa623c84256545cb66fbac27d30e52be7c.png';
import violinImage from 'figma:asset/13d8a8d7772227808267e7e05cd524fa94b2a2af.png';
import marimbaImage from 'figma:asset/e555f175b0b6ee0c801cd27e60979abab256956e.png';
import guitarImage from 'figma:asset/c1dd083dbf4cbe7376e05fb214333af891fc9ec2.png';
import fluteImage from 'figma:asset/cb462e97f8c925fc20820779b043d2db8deb7027.png';

// 화난 감정 악기 이미지
import pianoAngerImage from 'figma:asset/7c76c1ad7733bbfcdb88787492009ee11036d858.png';
import fluteAngerImage from 'figma:asset/5e111a99cb2891942bbb0c12103a6f09f8d0a276.png';
import guitarAngerImage from 'figma:asset/a785527a4a28395aa3dbe9de0db392756fb9b9ce.png';
import marimbaAngerImage from 'figma:asset/c2d616e1ce4ff2f0a5850f5fe59ed0a15983c3e2.png';
import violinAngerImage from 'figma:asset/56890fbf4cc6a23d634336c97e009b3719c85ada.png';

// 무기력 감정 악기 이미지
import fluteApathyImage from 'figma:asset/94c4779f7f639c680012764fbb4d20345b3f5296.png';
import guitarApathyImage from 'figma:asset/9da82d21f724fc127badffcad3e7690decb14535.png';
import marimbaApathyImage from 'figma:asset/89d146682901e9fab66410a3b096e8a4d3f88d38.png';
import pianoApathyImage from 'figma:asset/be802e7f39ef0490af44bcbf587df06bda52045a.png';
import violinApathyImage from 'figma:asset/a6958785b3ffd403902cb21f75497666ba22b7e3.png';

// 기쁨 감정 악기 이미지
import fluteJoyImage from 'figma:asset/f4ea543be3ee255028f992852106b909f78e2aed.png';
import guitarJoyImage from 'figma:asset/73f74a97727a14e5bc9cad2a3c3ae6626912981f.png';
import marimbaJoyImage from 'figma:asset/848e0a83f877081378d3af43b7a8e3429513be9d.png';
import pianoJoyImage from 'figma:asset/82e63b4b3a79de7089bf548de842f15a919dde5b.png';
import violinJoyImage from 'figma:asset/da5c2e9e4add91ffc902c548643799ac5ff732ba.png';

// 슬픔 감정 악기 이미지
import fluteSadnessImage from 'figma:asset/cfac8c853f5cca6b774d00a75e56da44a28dcc3c.png';
import guitarSadnessImage from 'figma:asset/98063e600a6fb4484563898cdca65bd19651cefa.png';
import marimbaSadnessImage from 'figma:asset/9c2c2c23c8f4f2dd5f1f3789459fe740f5e27923.png';
import pianoSadnessImage from 'figma:asset/ef3fce706dd4290a7c34f1e44b856ee001e51f39.png';
import violinSadnessImage from 'figma:asset/dbec9ed6286ddb29576de6beeaaa7720a785334f.png';

// 예민 감정 악기 이미지
import fluteSensitiveImage from 'figma:asset/ec29a36d004b1b0fd4cb29cea3e72bddd803977e.png';
import guitarSensitiveImage from 'figma:asset/f30655196c8758212808ec9d3935c3ff1b046a18.png';
import marimbaSensitiveImage from 'figma:asset/7ea0e4af874fc8b35bd1ef937e9de99a3db1bfad.png';
import pianoSensitiveImage from 'figma:asset/5db6da5eda17234dca1d168f675c8e2124629c0a.png';
import violinSensitiveImage from 'figma:asset/bcd224942b94ecd0c83118773d5cb2c02d113765.png';

export type CharacterType = 'PIANO' | 'GUITAR' | 'MARIMBA' | 'VIOLIN' | 'FLUTE';
export type EmotionType = 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';

// 기본 악기 이미지 (중립 표정)
export const characterImages: Record<CharacterType, string | null> = {
  PIANO: pianoImage,
  GUITAR: guitarImage,
  MARIMBA: marimbaImage,
  VIOLIN: violinImage,
  FLUTE: fluteImage,
};

// 감정별 악기 이미지
export const emotionCharacterImages: Record<EmotionType, Partial<Record<CharacterType, string>>> = {
  JOY: {
    FLUTE: fluteJoyImage,
    GUITAR: guitarJoyImage,
    MARIMBA: marimbaJoyImage,
    PIANO: pianoJoyImage,
    VIOLIN: violinJoyImage,
  },
  SADNESS: {
    FLUTE: fluteSadnessImage,
    GUITAR: guitarSadnessImage,
    MARIMBA: marimbaSadnessImage,
    PIANO: pianoSadnessImage,
    VIOLIN: violinSadnessImage,
  },
  ANGER: {
    PIANO: pianoAngerImage,
    FLUTE: fluteAngerImage,
    GUITAR: guitarAngerImage,
    MARIMBA: marimbaAngerImage,
    VIOLIN: violinAngerImage,
  },
  APATHY: {
    FLUTE: fluteApathyImage,
    GUITAR: guitarApathyImage,
    MARIMBA: marimbaApathyImage,
    PIANO: pianoApathyImage,
    VIOLIN: violinApathyImage,
  },
  SENSITIVE: {
    FLUTE: fluteSensitiveImage,
    GUITAR: guitarSensitiveImage,
    MARIMBA: marimbaSensitiveImage,
    PIANO: pianoSensitiveImage,
    VIOLIN: violinSensitiveImage,
  },
};

// 감정과 악기에 맞는 이미지 가져오기 함수
export function getEmotionCharacterImage(emotion: EmotionType, character: CharacterType): string | null {
  return emotionCharacterImages[emotion]?.[character] || characterImages[character];
}

export const characterInfo = {
  PIANO: { name: '피아노', icon: '🎹', image: pianoImage },
  GUITAR: { name: '기타', icon: '🎸', image: guitarImage },
  MARIMBA: { name: '마림바', icon: '🪘', image: marimbaImage },
  VIOLIN: { name: '바이올린', icon: '🎻', image: violinImage },
  FLUTE: { name: '플루트', icon: '🎺', image: fluteImage },
} as const;