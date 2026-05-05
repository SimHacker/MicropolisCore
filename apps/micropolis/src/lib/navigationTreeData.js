// micropolis/src/lib/navigationTreeData.js
// Data structure for site navigation. Emojis are encoded as HTML hex entities.

export const siteStructure = [
    {
        comment: "Root Page (Dynamically generated index)",
        url: '/',
        title: 'Micropolis Web',
        header: 'Site Index',
        description: '&#x1F3DB;&#xFE0F;&#x1F30D;&#x1FABD;&#x1F5FA;&#xFE0F; An index of all pages on the Micropolis Web site.', // Building, Globe, Knot, Map
        tooltip: 'Go to Micropolis Web Site Index',
    },
    // 2. About Section
    {
        comment: "About Section Container",
        url: '/pages/about',
        title: 'About Micropolis',
        header: 'About Micropolis',
        contentSlug: 'about',
        description: '&#x1F9D0;&#x1F3DB;&#xFE0F;&#x1F4A1;&#x1F468;&#x200D;&#x1F4BB; An exploration of the history, concepts, creators, and influences behind Micropolis.', // Monocle, Building, Lightbulb, Coder
        tooltip: 'Learn about Micropolis history and concepts',
        matchUrlPrefix: true,
        showSubTabs: true,
        children: [
            {
                comment: "Will Wright Page",
                url: '/pages/about/will-wright',
                title: 'Will Wright',
                header: 'Will Wright: SimCity Creator',
                contentSlug: 'about/will-wright',
                description: '&#x1F3AE;&#xFE0F;&#x1F3D9;&#xFE0F;&#x1F916;&#x1F9E0; Meet the visionary game designer who originally created SimCity, Spore, and The Sims.', // Game, City, Robot, Brain
            },
            {
                comment: "Don Hopkins Page Container",
                url: '/pages/about/don-hopkins',
                title: 'Don Hopkins',
                header: 'Don Hopkins: Micropolis Developer',
                contentSlug: 'about/don-hopkins',
                description: '&#x1F427;&#x1F4BB;&#x1F5B1;&#xFE0F;&#x1F355; Learn about the developer who worked on The Sims, ported SimCity, and developed Micropolis.', // Penguin, Laptop, Mouse, Pizza
                matchUrlPrefix: true,
                children: [
                    {
                        comment: "SimCity NeWS/HyperLook Version Page",
                        url: '/pages/about/don-hopkins/simcity-news-hyperlook',
                        title: 'SimCity NeWS/HyperLook',
                        header: 'SimCity for NeWS/HyperLook (1991-1992)',
                        contentSlug: 'about/don-hopkins/simcity-news-hyperlook',
                        description: '&#x1F4DC;&#x1F5A5;&#xFE0F;&#x1F17F;&#xFE0F;&#x2699;&#xFE0F; Porting SimCity Classic to Sun\'s PostScript-based NeWS/HyperLook environment.', // Scroll, Screen, P-Button, Gear
                        hideFromNav: true
                    },
                    {
                        comment: "SimCity X11/TCL/Tk Version Page",
                        url: '/pages/about/don-hopkins/simcity-x11-tcltk',
                        title: 'SimCity X11/TCL/Tk',
                        header: 'SimCity for X11/TCL/Tk (1993)',
                        contentSlug: 'about/don-hopkins/simcity-x11-tcltk',
                        description: '&#x1F1FD;&#x1F5A5;&#xFE0F;&#x2328;&#xFE0F;&#x1F9F0; Developed the Unix version using X11 and TCL/Tk, featuring pie menus.', // X-Button, Screen, Keyboard, Toolbox
                        hideFromNav: true
                    },
                    {
                        comment: "SimCityNet Multiplayer Version Page",
                        url: '/pages/about/don-hopkins/multiplayer-simcity-net',
                        title: 'SimCityNet Multiplayer',
                        header: 'Multiplayer SimCityNet (1993)',
                        contentSlug: 'about/don-hopkins/multiplayer-simcity-net',
                        description: '&#x1F91D;&#x1F465;&#x1F310;&#x1F50C; Created a networked, cooperative multiplayer version based on the X11/TCL/Tk code.', // Handshake, Silhouettes, Globe, Plug
                        hideFromNav: true
                    },
                    {
                        comment: "The Sims Contributions Page",
                        url: '/pages/about/don-hopkins/the-sims',
                        title: 'The Sims',
                        header: 'The Sims Contributions (1997-2000)',
                        contentSlug: 'about/don-hopkins/the-sims',
                        description: '&#x1F9D1;&#x200D;&#x1F91D;&#x200D;&#x1F9D1;&#x1F3E0;&#x1F6E0;&#xFE0F;&#x1F468;&#x200D;&#x1F4BB; Details on core development, UI, tools, and user empowerment for The Sims 1.', // People holding hands, House, Hammer+Wrench, Coder
                        hideFromNav: true
                    },
                    {
                        comment: "SimCity OLPC Version Page",
                        url: '/pages/about/don-hopkins/olpc-simcity',
                        title: 'SimCity OLPC',
                        header: 'SimCity for OLPC (2007-2008)',
                        contentSlug: 'about/don-hopkins/olpc-simcity',
                        description: '&#x1F4BB;&#x1F9D2;&#x1F30D;&#x1F4D6; Adapting and open-sourcing SimCity as Micropolis for the OLPC project.', // Laptop, Child, Globe, Book
                        hideFromNav: true
                    },
                    {
                        comment: "Micropolis C++/Python Integration Page",
                        url: '/pages/about/don-hopkins/micropolis-cpp-python',
                        title: 'Micropolis C++/Python',
                        header: 'Micropolis C++/Python Integration',
                        contentSlug: 'about/don-hopkins/micropolis-cpp-python',
                        description: '&#x1F40D;&#x2699;&#xFE0F;&#x1F9E9;&#x1F517; Refactoring the core SimCity engine into cleaner C++ integrated with Python via SWIG.', // Snake, Gear, Puzzle, Link
                        hideFromNav: true
                    },
                    {
                        comment: "Micropolis Linux PyGTK Version Page",
                        url: '/pages/about/don-hopkins/micropolis-linux-pygtk',
                        title: 'Micropolis Linux PyGTK',
                        header: 'Micropolis Linux PyGTK Version (Deprecated)',
                        contentSlug: 'about/don-hopkins/micropolis-linux-pygtk',
                        description: '&#x1F427;&#x1F5BC;&#xFE0F;&#x1F5B1;&#xFE0F;&#x1F4BF; A deprecated Linux desktop version using PyGTK, Cairo, and Pango, with pie menus.', // Penguin, Picture, Mouse, CD
                        hideFromNav: true
                    },
                    {
                        comment: "Micropolis Online Web Version Page",
                        url: '/pages/about/don-hopkins/micropolis-online-turbogears-openlaszlo',
                        title: 'Micropolis Online',
                        header: 'Micropolis Online (TurboGears/OpenLaszlo - Deprecated)',
                        contentSlug: 'about/don-hopkins/micropolis-online-turbogears-openlaszlo',
                        description: '&#x1F578;&#xFE0F;&#x1F310;&#x26A1;&#x1F4BB; A deprecated web client/server version using Python/TurboGears and Flash/OpenLaszlo.', // Web, Globe, Lightning, Laptop
                        hideFromNav: true
                    },
                    {
                        comment: "Micropolis WebAssembly Version Page (Current)",
                        url: '/pages/about/don-hopkins/micropolis-web-wasm-webgl-sveltekit',
                        title: 'Micropolis Web (Current)',
                        header: 'Micropolis Web (WASM/WebGL/SvelteKit - Current)',
                        contentSlug: 'about/don-hopkins/micropolis-web-wasm-webgl-sveltekit',
                        description: '&#x1F680;&#x1F578;&#xFE0F;&#x1F4CA;&#x1F4BB; The current WebAssembly port using SvelteKit, WebGL, and interactive diagrams.', // Rocket, Web, Chart, Laptop
                        hideFromNav: true
                    }
                ]
            },
            {
                comment: "Chaim Gingold Page",
                url: '/pages/about/chaim-gingold',
                title: 'Chaim Gingold',
                header: 'Chaim Gingold: Building SimCity',
                contentSlug: 'about/chaim-gingold',
                description: '&#x1F4D6;&#xFE0F;&#x1F3D7;&#xFE0F;&#x1F4CA;&#x1F9D1;&#x200D;&#x1F52C; Dive into insights from "Building SimCity," Chaim\'s book detailing the game\'s creation.', // Book, Construction, Chart, Scientist
            },
            {
                comment: "Brett Victor Page",
                url: '/pages/about/brett-victor',
                title: 'Brett Victor',
                header: 'Brett Victor: Dynamic Mediums',
                contentSlug: 'about/brett-victor',
                description: '&#x2728;&#x1F4A1;&#x1F5BC;&#xFE0F;&#x1F4BB; Explore the work of an influential designer focused on dynamic mediums for thought.', // Sparkles, Lightbulb, Picture, Laptop
            },
            {
                comment: "Stone Librande Page",
                url: '/pages/about/stone-librande',
                title: 'Stone Librande',
                header: 'Stone Librande: One-Page Designs',
                contentSlug: 'about/stone-librande',
                description: '&#x1F4C4;&#x1F9E9;&#x1F3AE;&#x1F4A1; Discover the design philosophy of Stone Librande, known for his insightful one-page documents.', // Page, Puzzle, Game, Lightbulb
            },
            {
                comment: "Ben Shneiderman Page",
                url: '/pages/about/ben-shneiderman',
                title: 'Ben Shneiderman',
                header: 'Ben Shneiderman: Direct Manipulation',
                contentSlug: 'about/ben-shneiderman',
                description: '&#x1F5B1;&#xFE0F;&#x1F9D1;&#x200D;&#x1F52C;&#x1F4CA;&#x1F4A1; Understand the principles championed by the computer scientist who coined "direct manipulation".', // Mouse, Scientist, Chart, Lightbulb
            },
            {
                comment: "Constructionist Education Section Container",
                url: '/pages/about/constructionist-education',
                title: 'Constructionist Education',
                header: 'Constructionist Education',
                contentSlug: 'constructionist-education',
                description: '&#x1F6E0;&#xFE0F;&#x1F9F1;&#x1F9D1;&#x200D;&#x1F3EB;&#x1F9D1;&#x200D;&#x1F393; An overview of the learning theory where knowledge is built through active creation and sharing.', // Hammer+wrench, Brick, Teacher, Student
                matchUrlPrefix: true,
                showSubTabs: true,
                children: [
                    {
                        comment: "Jean Piaget Page",
                        url: '/pages/about/constructionist-education/jean-piaget',
                        title: 'Jean Piaget',
                        header: 'Jean Piaget: Cognitive Development',
                        contentSlug: 'constructionist-education/jean-piaget',
                        description: '&#x1F476;&#x1F914;&#x1F9E0;&#x1F1E8;&#x1F1ED; Review the foundational theories of the Swiss psychologist on child cognitive development.', // Baby, Thinking, Brain, Swiss Flag
                    },
                    {
                        comment: "Seymour Papert Page",
                        url: '/pages/about/constructionist-education/seymour-papert',
                        title: 'Seymour Papert',
                        header: 'Seymour Papert: Constructionism & Logo',
                        contentSlug: 'constructionist-education/seymour-papert',
                        description: '&#x1F422;&#x1F9F1;&#x1F4BB;&#x1F9D1;&#x200D;&#x1F3EB; Meet the MIT mathematician who pioneered AI, developed Logo, and founded Constructionism.', // Turtle, Brick, Laptop, Teacher
                    },
                    {
                        comment: "Marvin Minsky Page",
                        url: '/pages/about/constructionist-education/marvin-minsky',
                        title: 'Marvin Minsky',
                        header: 'Marvin Minsky: AI & Society of Mind',
                        contentSlug: 'constructionist-education/marvin-minsky',
                        description: '&#x1F916;&#x1F9E0;&#x1F9E9;&#x1F465; Delve into the thinking of an AI founding father, co-founder of MIT\'s AI Lab.', // Robot, Brain, Puzzle, Silhouettes
                    },
                    {
                        comment: "Alan Kay Page",
                        url: '/pages/about/constructionist-education/alan-kay',
                        title: 'Alan Kay',
                        header: 'Alan Kay: Dynabook & OOP',
                        contentSlug: 'constructionist-education/alan-kay',
                        description: '&#x1F4BB;&#x1F4D6;&#x1F4A1;&#x1F468;&#x200D;&#x1F3EB; Learn about the computer scientist, key figure in OOP & GUIs, who envisioned the Dynabook.', // Laptop, Book, Lightbulb, Teacher
                    },
                    {
                        comment: "Doreen Nelson Page",
                        url: '/pages/about/constructionist-education/doreen-nelson',
                        title: 'Doreen Nelson',
                        header: 'Doreen Nelson: Design-Based Learning',
                        contentSlug: 'constructionist-education/doreen-nelson',
                        description: '&#x1F3D7;&#xFE0F;&#x1F9F1;&#x1F9D1;&#x200D;&#x1F3EB;&#x1FABD; Explore Design-Based Learning (DBL), the hands-on educational methodology.', // Crane, Brick, Teacher, Knot
                    }
                ]
            }
        ]
    },
    // 3. Building SimCity
    {
        comment: "Building SimCity Page",
        url: '/pages/building-simcity',
        title: 'Building SimCity',
        header: 'Building SimCity Book Excerpts',
        contentSlug: 'building-simcity',
        description: '&#x1F3D7;&#xFE0F;&#x1F4D6;&#x270D;&#xFE0F;&#x1F50D; Excerpts and info related to Chaim Gingold\'s book detailing SimCity\'s design history.', // Construction, Book, Writing Hand, Magnifying Glass
        tooltip: 'Read about the making of SimCity',
        excludeFromRss: true,
    },
    // 4. Reverse Diagrams
    {
        comment: "Reverse Diagrams Page",
        url: '/pages/reverse-diagrams',
        title: 'Reverse Diagrams',
        header: 'SimCity Reverse Diagrams',
        contentSlug: 'reverse-diagrams',
        description: '&#x1F4CA;&#x270D;&#xFE0F;&#x2699;&#xFE0F;&#x1F4A1; Chaim Gingold\'s detailed diagrams visually reverse-engineering SimCity Classic\'s mechanics.', // Chart, Writing Hand, Gear, Lightbulb
        tooltip: 'Explore SimCity Classic mechanics through visual diagrams',
        matchUrlPrefix: true,
        showSubTabs: false,
    },
    // 5. All Content page
    {
        comment: "All Content Page",
        url: '/all',
        title: 'All Content',
        header: 'All Micropolis Content',
        description: '&#x1F4DA;&#x1F5FA;&#xFE0F;&#x1F50D;&#x1F4DC; A comprehensive view of all Micropolis content on a single page.', // Books, Map, Magnifying Glass, Scroll
        tooltip: 'View all content on a single page',
        hideFromNav: true
    },
    // 6. Micropolis License
    {
        comment: "Micropolis License Page",
        url: '/pages/micropolis-license',
        title: 'Micropolis License',
        header: 'Micropolis Licensing',
        contentSlug: 'micropolis-license',
        description: '&#x2696;&#xFE0F;&#x1F4DC;&#x270D;&#xFE0F;&#x1F913; Review the GPL and Public Name licenses that govern this project.', // Scales, Scroll, Writing Hand, Nerd Face
        tooltip: 'View licensing information for Micropolis',
        excludeFromAll: true,
        excludeFromRss: true,
        hideFromNav: false,
    },
    // --- Placeholder for Game Section ---
    {
        comment: "Game Placeholder Section",
        url: '/game',
        title: 'Game',
        header: 'Micropolis Game',
        description: '&#x1F3D9;&#xFE0F;&#x1F3AE;&#x1F5B1;&#xFE0F;&#x1F680; Interactive Micropolis game simulation.', // City, Game, Mouse, Rocket
        tooltip: 'Play Micropolis',
        matchUrlPrefix: true,
        hideFromNav: true,
    },
    // --- External Links ---
    {
        comment: "Source Code External Link",
        url: 'https://github.com/SimHacker/MicropolisCore',
        title: 'Source Code',
        header: 'Micropolis Source Code',
        description: '&#x1F4BB;&#x2328;&#xFE0F;&#x1F419;&#x1F468;&#x200D;&#x1F4BB; Explore the open-source MicropolisCore repository on GitHub. Contribute!', // Laptop, Keyboard, Octopus, Coder
        tooltip: 'View MicropolisCore Source Code on GitHub',
        external: true
    },
    {
        comment: "Patreon Support External Link",
        url: 'https://www.patreon.com/DonHopkins',
        title: 'Please Support',
        header: 'Support Don Hopkins',
        description: '&#x1F64F;&#x1F496;&#x1F44D;&#x1FA99; Help sustain Micropolis development by supporting Don Hopkins on Patreon.', // Pray, Heart, Thumbs Up, Coin
        tooltip: 'Support Don Hopkins on Patreon',
        external: true
    },
]; 