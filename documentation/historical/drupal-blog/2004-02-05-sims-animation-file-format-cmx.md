# Sims Character Animation File Format

*Thursday, February 5, 2004*

Sketch of the binary VitaBoy layout as pasted into the original blog post (historical; typos preserved).

```
CMX File:
 int32 skeletonCount;
 Skeleton skeletons[skeletonCount];
 int32 suitCount;
 Suit suits[suitCount];
 int32 skillCount;
 Skill skills[skillCount];

Skeleton:
 CountedString name;
 int32 boneCount;
 Bone bones[boneCount];

Bone:
 CountedString name;
 CountedString parentName;
 int32 hasProps;
   ? Props prop;
 float trans[3];
 float rot[4];
 int32 canTranslate;
 int32 canRotate;
 int32 canBlend;
 int32 canWiggle;
 int32 wigglePower;

Skill:
 CountedString name;
 CountedString fileName; [of CompressedFloatingPoint file]
 float duration;
 float distance;
 int32 isMoving;
 int32 numTranslations;
 int32 numRotations;
 int32 motionCount;
 Motion motions[mountCount];

Motion:
 CountedString boneName;
 int32 frames;
 float duration;
 int32 hasTranslation;
 int32 hasRotation;
 int32 translationsOffset;
 int32 rotationsOffset;
 int32 hasProps;
   ? Props props;
 int32 hasTimeProps;
   ? TimeProps timeProps;

Suit:
 CountedString name;
 int32 Type;
 int32 hasProps;
   ? Props prop;
 int32 skinCount;
 Skin skins[skinCount];

Skin:
 CountedString boneName;
 CountedString name; [of DeformableMesh file]
 int32 flags;
 int32 hasProps;
   ? Props prop;

PropsKeyValue:
 CountedString key;
 CountedString value;

Props:
 int32 size;
 PropsKeyValue keyValues[size];

TimePropsKeyValue:
 int32 key;
 Props value;

TimeProps:
 int32 size;
 TimePropsKeyValue keyValues[size];

CountedString:
 byte len;
   (len == 255)
     ? int32 len;
     : char string[len];

DeformableMesh:
 CountedString fileName;
 CountedString textureName;
 int32 boneCount;
 CountedString boneNames[boneCount];
 int32 faceCount;
 DeformableFace faces[faceCount];
 int32 boneBindingCount;
 BoneBinding boneBindings[boneBindingCount];
 int32 textureVertexCount;
 TextureVertex textureVertices[textureVertexCount];
 int32 blendDataCount;
 BlendData blendData[blendDataCount];
 int32 vertexCount;
 NormalVertex vertices[vertexCount];

DeformableFace:
 int aVertexIndex;
 int bVertexIndex;
 int cVertexIndex;

BoneBinding:
 int boneIndex;
 int firstVert;
 int vertCount;
 int firstBlendedVert;
 int blendedVertCount;

TextureVertex:
 float u;
 float v;

BlendData:
 int32 weightFixed;
 int32 otherVertexIndex;

NakedVertex:
 float x;
 float y;
 float x;

NormalVertex:
 NakedVertex naked;
 NakedVertex norm;
```

---

## Source

- Blog permalink: `http://www.donhopkins.com/categories/gameDesign/2004/02/05.html#a74`  
- Wayback category page: https://web.archive.org/web/20040317155006/http://www.donhopkins.com/blog/categories/gameDesign/
