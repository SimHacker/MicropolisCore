<script>

let { 
    showAbout,
  } = $props();

</script>

<div id="about" class="fullscreen mouseless">

  <div
    class="text-shadow about-show {showAbout ? 'about-show-opened' : 'about-show-closed'}"
    onclick="{(event) => showAbout = !showAbout}"
  >{showAbout ? "X" : "+"}</div>

  {#if showAbout}

    <div class="text-shadow about-div">

      <b>This is Micropolis in WebAssembly!</b><br/>
      Based on the original SimCity Classic from Maxis,<br/>
      designed by Will Wright, ported by Don Hopkins.<br/>
      This is just an unfinished evolving scrappy fiddle.<br/>
      Please support its further development via
      <a
        target="_new"
        href="https://www.patreon.com/DonHopkins"
      >Patreon</a>.<br/>
      GitHub: <a
        target="_new"
        href="https://github.com/SimHacker/MicropolisCore"
      >https://github.com/SimHacker/MicropolisCore</a>.<br/>
      YouTube: <a
        target="_new"
        href="https://www.youtube.com/watch?v=wlHGfNlE8Os"
      >"MicropolisWeb Demo 1"</a> and<br/>
        <a
        target="_new"
        href="https://www.youtube.com/watch?v=BBVyCpmVQew"
      >"Space Inventory Cellular Automata Music 1"</a>.<br/>
      More Info: <a
        target="_new"
        href="https://mitpress.mit.edu/9780262547482/building-simcity/"
        >Chaim Gingold's book "Building SimCity"</a><br/>
        and <a
        target="_new"
        href="https://smalltalkzoo.thechm.org/users/Dan/uploads/SimCityReverseDiagrams.pdf"
        >Chaim Gingold's "SimCity Reverse Diagrams"</a>.<br/>
      The name "Micropolis" used under the terms of the<br/>
      <a
        target="_new"
        href="https://MicropolisCore/SimHacker/MicropolisCore/MicropolisPublicNameLicense.md"
        >Micropolis Public Name License</a>.<br/>
      Drag left button to pan, spin mouse wheel to zoom.<br/>
      Arrow keys pan, comma and period keys zoom.<br/>
      Letter keys load various cities, \ to generate.<br/>
      Numeric keys set the speed, 0 toggles pause.<br/>
      The brackets lower and raise the tax rate.<br/>
      The - and = keys switch between tile sets!<br/>
      Click the "<div class="about-show-opened-text">X</div>" button above to hide this window.<br/>
      More features and easter eggs on the way...<br/>
      <em>
        WARNING: <u>DO NOT</u> hit the space bar,<br/>
        because that will open up the 
        <a
          target="_new"
          href="https://www.youtube.com/watch?v=WPMeWas4kXM"
        >Space Inventory</a> !<br/>
      </em>

    </div>

  {/if}

</div>


<style>

    .mouseless {
      pointer-events: none;
    }
  
    .fullscreen {
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 100;
      top: 0px;
      left: 0px;
    }
  
    .text-shadow {
      text-shadow: 
        1px 1px 0 black, /* Right and down */
        -1px -1px 0 black, /* Left and up */
        -1px 1px 0 black, /* Left and down */
        1px -1px 0 black; /* Right and up */
    }
  
    .about-show {
      position: absolute;
      left: 0px;
      top: 0px;
      pointer-events: auto;
      cursor: pointer;
      margin-left: 3px;
      margin-top: 3px;
      width: 20px;
      height: 20px;
      border: 1px solid black;
      align-items: center;
      justify-content: center;
      font-size: 16x;
      display: flex;
      padding-top: 2px;
      color: white;
      font-weight: bold;
    }
  
    .about-show-closed {
      background: #ffffff80;
      color: #00ff00;
      font-size: 20px;
    }
  
    .about-show-opened {
      background: #ffffff80;
      color: #ff0000;
    }
  
    .about-show-opened-text {
      background: #ffffff80;
      color: #ff0000;
      display: inline-flex;
      width: 20px;
      height: 20px;
      border: 1px solid black;
      align-items: center;
      justify-content: center;
      font-size: 16x;
    }
  
    .about-div {
      position: absolute;
      padding-left: 30px;
      padding-top: 5px;
      padding-right: 5px;
      padding-bottom: 5px;
      font-size: 16px;
      line-height: 1.25em;
      color: white;
      pointer-events: none;
      user-select: none;
      background: #00000080;
      border-right: 1px solid black;
      border-bottom: 1px solid black;
    }
  
    .about-div b {
      font-size: 1.5em;
      color: #40ff40
    }
  
    .about-div em {
      color: #ff0000;
      font-weight: bold;
      font-size: 1.1em;
    }
  
    .about-div a {
      pointer-events: auto; /* Allows the link to be clickable */
      user-select: auto; /* Allows the link to be selectable */
      color: yellow; /* Optional: Different color for better visibility */
      text-decoration: underline; /* Optional: Underline to indicate it's a link */
    }

  </style>
  