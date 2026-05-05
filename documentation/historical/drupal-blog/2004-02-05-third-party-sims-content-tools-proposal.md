# A Proposal to Develop Third Party Content Authoring Tools for The Sims

*Thursday, February 5, 2004*

This is a proposal I wrote to Maxis after *The Sims* was released in March 2000, outlining some of my ideas for third party content authoring tools that I could develop. This led to [The Sims Transmogrifier](https://web.archive.org/web/20040317155006/http://www.thesimstransmogrifier.com/), but it touches on several other interesting tools and projects that Maxis never got around to.

**A Proposal to Develop Third Party Content Authoring Tools for The Sims**  
by Don Hopkins, March 2000

### Problem Definition

- There is strong demand from many third parties who want to develop their own custom content for The Sims, including characters and objects.

### Proposed Solution

- Update, clean up and document the content creation tools, so third parties can make their own characters and objects for The Sims.
  - Port the tools to the latest version of 3D Studio Max.
  - Make the tools self contained so they can be run stand-alone, by removing all dependencies on the Maxis environment and expensive software packages: Character Studio (Biped, Physique), Access, SourceSafe, MKS Toolkit (Korn Shell).
  - Document the content creation tools with an overview, examples, tutorials, and a reference manual. Write down the folklore that has been passed by word of mouth. Read over the code and document how it actually behaves.
  - Provide consulting, training and content creation services to third parties who want custom content authored for The Sims, but don't want or know how to do it themselves.
- Develop a Sims Content Authoring SDK, so it's possible for third parties to create specialized content creation tools, like FaceLift.

### Goals

1. **Third Party Character Creation and Customization**
   - Characters include virtual people who the user can play with, as well as autonomous non-player characters with programmed behaviors. Characters consist of bodies, heads and hands of 3D polygonal meshes with texture mapped bitmap skins.
   - Characters are created at Maxis by highly skilled artists using expensive tools like 3D Studio Max, Character Studio, the CMX exporter, and Photoshop.
   - Simplify the content creation tools and make them run stand-alone, so third party artists and designers can create their own characters and objects.
   - Maxis' expert 2D character artists currently use Photoshop to paint body textures in layers, then flatten and dither them into 256 color bitmap files — “flesh out” the process of applying layered clothing to naked bodies and dithering to 8 bits, so anyone can dress up their characters in all kinds of clothes.
   - Maxis' expert 3D modeling artists create textured low-poly rigid meshes (like heads, hands and accessories) attached to individual bones, and the CMX exporter creates rigid suits — make the CMX exporter easy for third parties to use.
   - Maxis' expert 3D character modeling artists attach textured low-poly deformable meshes (like bodies) to skeletons using Character Studio Physique and Biped — enhance the CMX exporter to support Max's mesh attachment approaches so third parties can create bodies.
   - Maxis designers and programmers use the Edith tool to configure behavior — clean up and document Edith for third party designers and programmers.

2. **Third Party Object Creation and Customization**
   - Objects consist of pre-rendered z-buffered sprites, packaged together with character animations, sound effects and programmed behavior.
   - Clean up and document the sprite exporter for third party artists (very Max-specific, especially for multi-tile objects).
   - Document the CMX exporter for character/object interaction animation.

3. **Enable Third Party Content Creation Tool Development**
   - Develop and document an SDK for third-party tools; encourage tools like FaceLift and Blueprint.
   - Examples floated in the proposal: “BodyLift”, layered skin tooling, animation mixing tools, template factories (PictureFramer, JukeboxFactory, etc.).

---

## Source

- Blog permalink: `http://www.donhopkins.com/categories/gameDesign/2004/02/05.html#a70`  
- Wayback category page: https://web.archive.org/web/20040317155006/http://www.donhopkins.com/blog/categories/gameDesign/
