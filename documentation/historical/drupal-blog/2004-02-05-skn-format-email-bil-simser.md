# Details on The Sims Character Animation File Format and Rendering

*Thursday, February 5, 2004*

Email thread on **SKN** / deformable mesh export (March 2000).

---

From: "Bil Simser"  
To: "Don Hopkins"  
Sent: Tuesday, March 21, 2000 7:17 AM  
Subject: SKN format

Hi Don,

Is there any way you can just toss me a bone on the SKN files? Just a quick overview? I have most of it but just trying to figure out how the groups are identified. I know it's the 3rd section (after the faces) but not sure what the 4 numbers are for? Can you give me a quick rundown of the file? Thanks.

-Bil

---

From: "Don Hopkins"  
To: "Bil Simser"  
Sent: Tuesday, March 21, 2000 12:10 PM  
Subject: Re: SKN format

The thing that makes the mesh format weird are the blended vertices, attached to two bones at once. Here are some design documents I wrote, about the Sims file formats, and the animation system. It documents the binary file format, while the cmx files are text, but pretty much equivalent, but maybe missing a few weird fields. It doesn't document the far file format, but I can write that up some time, since it's pretty simple.

-Don

---

From: "Don Hopkins"  
To: "Bil Simser"  
Cc: "Don Hopkins"  
Sent: Tuesday, March 21, 2000 12:48 PM  
Subject: Re: SKN format

What the exporter does, that may not be obvious from the file format, is to figure out from the texture map coordinates and the smoothing groups which vertices to duplicate and collapse.

The exported faces share vertices when possible, but have unique vertices if they're in different smoothing groups. Each vertex it exports (indexed by the faces) also has a normal. So if two adjacent faces are in different smoothing groups, their shared vertices need to have their own normals (calculated by averaging and renormalizing all the normals of the faces in the same smoothing group sharing that vertex), so those shared vertices are duplicated for each unique normal. The blended vertices also have their own normals, that are blended as well.

All the non-blended vertices have their own texture map coordinates too, in a parallel array. The position and normal of each blended vertex is weighted averaged with a non-blended vertex that has its own texture map coordinate, so blended vertices don't need their own texture map coordinates.

If there are any blended vertices (as with bodies but not heads), the blendedDataCount will be greater than zero, and the textureVertexCount will be less than the total vertexCount, in fact: `textureVertexCount + blendedDataCount == vertexCount`, because the vertices array contains the unblended vertices followed by the blended vertices (each vertex with a normal, i.e. a NormalVertex). The textureVertices array is parallel to the first segment of the vertices array (the rigid vertices), and the blendData array is parallel to the second segment (the blended vertices).

To draw them, you first transform all the vertices[vertexCount] to world coordinates according to the boneBindings, into transformedVertices[vertexCount], then you loop over the blended vertices to blend them with the appropriate other vertices. If i is an index into blendData (from 0 to blendDataCount-1), then i+textureVertexCount is an index into the corresponding blended vertex, and you blend together transformedVertices[i+textureVertexCount] and transformedVertices[blendData[i].otherVertexIndex] (modifying the former one in place, by converting the weightFixed to floating point by dividing by `(float)0x00008000` and doing a weighted average to blend together the vertex and the normal, then renormalizing the normal). Then draw the mesh by looping over the DeformableFaces, indexing into the transformedVertices from 0..textureVertexCount-1 and the corresponding texture vertices by the vertex indices in the faces.

I hope that explains those mysterious zeros. (Sorry it's so complicated!)

-Don

---

From: "Don Hopkins"  
To: "Don Hopkins"; "Bil Simser"  
Sent: Tuesday, March 21, 2000 1:10 PM  
Subject: Re: SKN format

I wrote:

> and you blend together transformedVertices[i+textureVertexCount] and transformedVertices[blendData[i].otherVertexIndex] (modifying the former one in place, by converting the weightFixed to floating

Oops I mean "modifying the latter one in place," that is, an optimized version of:

```
transformedVertices[blendData[i].otherVertexIndex] =
  Blend(
    transformedVertices[blendData[i].otherVertexIndex],
    transformedVertices[i+textureVertexCount],
    weight)
```

where Blend multiplies the first arg by (1.0 - weight) and adds to it the second arg multiplied by weight (then renormalizes the normal).

-Don

---

## Source

- Blog permalink: `http://www.donhopkins.com/categories/gameDesign/2004/02/05.html#a75`  
- Wayback category page: https://web.archive.org/web/20040317155006/http://www.donhopkins.com/blog/categories/gameDesign/
