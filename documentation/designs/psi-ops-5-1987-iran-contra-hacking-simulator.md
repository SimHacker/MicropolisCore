# PSI-OPS-5: A 1987 OPS-5 production-rule program that simulates the Iran-Contra Scandal as a Unix attack tree

## Spring 1987 at UMD. Don writes "a useful OPS-5 program" for AI class. The hosts are named after the Reagan basement war room, a Fawn Hall paper shredder, and prep.ai.mit.edu. The hearings are on TV every night.

By Don Hopkins. Source: *CMSC421 Project 6: A useful OPS-5 program*, University of Maryland, spring 1987.

> **What this is.** PSI-OPS-5 is a *game*. It is an educational classroom simulator I wrote as a homework assignment for an undergraduate AI class in spring 1987, in the same spirit as my earlier [Logo Adventure for C64 Terrapin Logo](https://donhopkins.medium.com/logo-adventure-for-c64-terrapin-logo-3725f7e9ddd0) game: a small program whose value is showing off the language. It runs entirely against its own toy world -- six fictional hosts, around twenty fictional accounts, no network, no real machines, no real users, no real passwords. The world is named after political figures from the [Iran-Contra Scandal](https://en.wikipedia.org/wiki/Iran%E2%80%93Contra_affair) as a piece of period [political satire](https://en.wikipedia.org/wiki/Political_satire), the same way [Lemonade Stand](https://en.wikipedia.org/wiki/Lemonade_Stand_(video_game)) dressed an inventory-management exercise as a retail game and [Hammurabi](https://en.wikipedia.org/wiki/Hammurabi_(video_game)) dressed a population dynamics simulation as a tax-policy game. Forward-chaining production rules are the language mechanic; [an adventure-game-style](https://en.wikipedia.org/wiki/Adventure_game) attack-graph search is the player's role; the news of the day is the theme. The point of the program is to show off the [Rete pattern matcher](https://en.wikipedia.org/wiki/Rete_algorithm) doing something visibly clever, not to attack anything that exists.

It was the spring semester of my junior year at the [University of Maryland](https://en.wikipedia.org/wiki/University_of_Maryland,_College_Park), the [Iran-Contra Scandal](https://en.wikipedia.org/wiki/Iran%E2%80%93Contra_affair) was the lead story on every nightly news broadcast, and Professor [Jim Hendler](https://en.wikipedia.org/wiki/James_Hendler)'s [AI](https://en.wikipedia.org/wiki/Artificial_intelligence) class CMSC421 had just assigned Project 6: write a useful program in [OPS-5](https://en.wikipedia.org/wiki/OPS5).

OPS-5 is [Charles Forgy](https://en.wikipedia.org/wiki/Charles_Forgy)'s [forward-chaining](https://en.wikipedia.org/wiki/Forward_chaining) [production-rule](https://en.wikipedia.org/wiki/Production_system_(computer_science)) language out of [CMU](https://en.wikipedia.org/wiki/Carnegie_Mellon_University), written in the late 70s, made famous by the [Rete pattern-matching algorithm](https://en.wikipedia.org/wiki/Rete_algorithm) Forgy invented to make it efficient. It was to mid-80s [expert systems](https://en.wikipedia.org/wiki/Expert_system) what [Prolog](https://en.wikipedia.org/wiki/Prolog) was to the [logic-programming](https://en.wikipedia.org/wiki/Logic_programming) tradition: the rule-based language that produced the era's only large-scale commercial expert system success, Digital Equipment Corporation's [XCON / R1](https://en.wikipedia.org/wiki/Xcon), which configured every [VAX](https://en.wikipedia.org/wiki/VAX) computer DEC sold from 1980 onwards, saving DEC tens of millions of dollars a year by getting the cable lengths right. We were at the high-water mark of the [first AI summer](https://en.wikipedia.org/wiki/AI_winter), six months before the AI winter that followed broke the news of itself.

I decided my "useful program" would be a hacking *simulator* -- a classroom game and political parody, not a tool. Forward-chaining production rules turn out to be a beautiful fit for modeling network attacks *as fiction*: each rule fires when a particular pattern of trust-or-vulnerability facts is present in working memory, and asserts new facts representing the consequence -- a new shell session, a leaked password, a wiped audit log. Stack enough rules and you get a forward-chaining attack-graph generator: a small declarative program that searches for paths from "logged in as nobody at nowhere" to "diary file mailed to USENET, audit logs scrubbed, exit". The program prints a play-by-play trace to stdout. It touches no network. It is a homework demonstration of [OPS-5](https://en.wikipedia.org/wiki/OPS5) and the [Rete algorithm](https://en.wikipedia.org/wiki/Rete_algorithm), not a functional exploit kit.

And since the hearings were on TV every night, the cast naturally came from there. I call the program **PSI-OPS-5**, partly because [PSI-OPS](https://en.wikipedia.org/wiki/Psychological_warfare) was a perfectly good [Cold War](https://en.wikipedia.org/wiki/Cold_War) acronym (PSI-OPS = "psychological / psy / spy operations"), partly because OPS-5 was the language, and partly because the *5* sounded like a serial-number suffix on a declassified NSC programme.

---

## The plot: pretend machines, real names

Inspired by the [Iran-Contra Scandal](https://en.wikipedia.org/wiki/Iran%E2%80%93Contra_affair) on the nightly news and the period folklore of Unix trust hacking (`.rhosts` chains, the IFS trick, password guessing from GECOS fields), I wrote an OPS-5 program for CMSC421 that *simulates* breaking into Oliver North's [Intimus 007S](https://www.intimus.com/) paper shredder and posting incriminating documents to the `email => talk.rumor` gateway at ucbvax. The [Morris Worm](https://en.wikipedia.org/wiki/Morris_worm) did not exist yet -- it would not hit until [2 November 1988](https://en.wikipedia.org/wiki/November_2,_1988), eighteen months after I turned this in. The homework is satire written *before* RTM; the real worm arrived later and eerily matched several of the same attack patterns the toy rules had already been narrating as fiction.

Everything below happens inside OPS-5 working memory. When the trace says the agent "breaks in," "spreads," or "posts to Usenet," a production rule fires and asserts a new `(session ...)`, `(goal ...)`, or `(modify ...)` fact. No packets leave the VAX. No shredder is harmed. The win condition is `(halt)` after `(write ...)` narration, not a real mailing list post.

The intended plot, as the rules narrate it:

1. Start as `nobody@nowhere` with an open telnet goal to **(pretend)** `rms`/`rms` on **(pretend)** `prep` -- the code's bootstrap foothold, not a dormouse session (the `(write ...)` trace is the story; working memory is the stage).
2. **(Pretend)** spread via `.rhosts` chains toward **(pretend)** `dormouse` (my **(real)** professor [Jim Hendler](https://en.wikipedia.org/wiki/James_Hendler)'s Sun, renamed) and **(pretend)** `mimsy` (the CS department VAX) through Hendler's trust entries.
3. **(Pretend)** use the IFS hack (`crack9`) to become root on **(pretend)** `mimsy`.
4. **(Pretend)** keep chaining through password guessing and the other rule clusters.
5. **(Pretend)** reach **(pretend)** `tycho`, then **(pretend)** `basement`, then **(pretend)** `intimus-007s`, recover **(pretend)** `diary` and **(pretend)** `notes`, and **(pretend)** mail them to **(pretend)** `post-talk-rumor@ucbvax`.

[OPS-5](https://en.wikipedia.org/wiki/OPS5) is genuinely excellent at this kind of declarative graph search **(for real)**. The worm, the shredder, and the Usenet exfiltration are satire **(for pretend)**.

The host names borrow from machines and people I actually knew. **(For real)**, [mimsy.cs.umd.edu](https://en.wikipedia.org/wiki/Through_the_Looking-Glass) had a lot of courtesy "network contact" users who worked for the NSA at Fort Meade, because UMD connected to [MILNET](https://en.wikipedia.org/wiki/MILNET) through the infamous NSA IMP 57 -- which you were not supposed to mention in public. The fact that mimsy and [dockmaster.ncsc.mil](http://multicians.org/site-dockmaster.html) had similar `*.57` IP addresses kind of gave it away. **(For real)**, [tycho](https://groups.google.com/forum/#!topic/net.net-people/pavX0NDLSjA) was one of NSA's Unix machines, a PDP-11 running Version 6 Unix -- another thing nobody was supposed to say in public, on pain of publicly apologizing and endorsing the official NSA cover story that very few employees of NSA are even aware that [Usenet](https://en.wikipedia.org/wiki/Usenet) exists. **(For real)**, North actually had an Intimus 007S -- "the ace of security paper shredders." The homework world renames those facts into toy hosts and accounts; the rules do not reach them.

---

## The Scandal in five paragraphs (for the OPS-5 readers)

In [1979](https://en.wikipedia.org/wiki/1979), the [Iranian Revolution](https://en.wikipedia.org/wiki/Iranian_Revolution) overthrew the [Shah](https://en.wikipedia.org/wiki/Mohammad_Reza_Pahlavi) and installed [Ayatollah Khomeini](https://en.wikipedia.org/wiki/Ruhollah_Khomeini). Iranian-backed [Hezbollah](https://en.wikipedia.org/wiki/Hezbollah) in Lebanon began taking American hostages. In Nicaragua, the leftist [Sandinista](https://en.wikipedia.org/wiki/Sandinistas) government had taken power in 1979 and the [CIA](https://en.wikipedia.org/wiki/CIA) was funding right-wing rebels (the [Contras](https://en.wikipedia.org/wiki/Contras)) to fight them. In 1982, Congress passed the [Boland Amendment](https://en.wikipedia.org/wiki/Boland_Amendment) forbidding U.S. agencies from spending appropriated funds to overthrow the Sandinistas. President [Ronald Reagan](https://en.wikipedia.org/wiki/Ronald_Reagan) wanted to keep funding the Contras anyway.

The plan, principally executed by [CIA Director](https://en.wikipedia.org/wiki/CIA_Director) [William Casey](https://en.wikipedia.org/wiki/William_Casey), National Security Advisor [Robert McFarlane](https://en.wikipedia.org/wiki/Robert_McFarlane) (and his successor [John Poindexter](https://en.wikipedia.org/wiki/John_Poindexter)), and [NSC](https://en.wikipedia.org/wiki/National_Security_Council_(United_States)) staffer Lt. Col. [Oliver North](https://en.wikipedia.org/wiki/Oliver_North), was elegant in the way only ill-conceived covert operations are: sell [TOW anti-tank](https://en.wikipedia.org/wiki/TOW_(missile)) and [HAWK anti-aircraft](https://en.wikipedia.org/wiki/MIM-23_Hawk) missiles to Khomeini's Iran (in violation of an arms embargo), via Israel as cut-out, in exchange for Hezbollah releasing American hostages, then divert the *profits* to the Contras. Two birds, one constitutional crisis.

It came apart on [5 October 1986](https://en.wikipedia.org/wiki/October_5), when a CIA cargo plane was shot down over Nicaragua and the surviving crewman, [Eugene Hasenfus](https://en.wikipedia.org/wiki/Eugene_Hasenfus), was captured. A month later the Lebanese magazine [Ash-Shiraa](https://en.wikipedia.org/wiki/Ash-Shiraa) broke the arms-for-hostages story. On [25 November 1986](https://en.wikipedia.org/wiki/November_25,_1986), Attorney General [Edwin Meese](https://en.wikipedia.org/wiki/Edwin_Meese) announced the diversion to the Contras at a White House press conference. Poindexter resigned. North was fired. North's secretary [Fawn Hall](https://en.wikipedia.org/wiki/Fawn_Hall) spent the next several days helping shred documents in the EOB basement office on a German-made [Intimus 007S high-security paper shredder](https://en.wikipedia.org/wiki/Paper_shredder) (the "007" being a manufacturer model number, not a self-aware joke), and smuggling additional documents out of the building stuffed in her boots and brassiere. She would later testify, "Sometimes you have to go above the written law."

The [Tower Commission](https://en.wikipedia.org/wiki/Tower_Commission) reported in February 1987. Independent Counsel [Lawrence Walsh](https://en.wikipedia.org/wiki/Lawrence_Walsh) was appointed in December 1986 and would still be filing indictments in 1992. The joint House-Senate [Iran-Contra hearings](https://en.wikipedia.org/wiki/Iran-Contra_hearings) ran on television from May to August 1987. Casey died of a brain tumor on 6 May 1987, the day after the hearings opened, never having testified -- a coincidence of timing that the conspiratorially-minded have not let go of in the forty years since. Oliver North testified in his [Marine Corps](https://en.wikipedia.org/wiki/United_States_Marine_Corps) dress uniform 7-14 July 1987, became briefly a folk hero, ran for the Senate from Virginia in 1994 and lost. Reagan accepted "responsibility" for the diversion in a televised address on 4 March 1987 with the rhetorical formulation that "a few months ago I told the American people I did not trade arms for hostages. My heart and my best intentions still tell me that's true, but the facts and the evidence tell me it is not."

That last sentence is, depending on your taste, the most beautifully calibrated political non-apology of the late twentieth century or the precursor of every [plausible-deniability](https://en.wikipedia.org/wiki/Plausible_deniability) framework that has come since. It was also playing on televisions across College Park, Maryland, while a 22-year-old computer-science major sat in his dorm room writing forward-chaining production rules to model exactly the sort of trust-violating, audit-trail-erasing, password-bypassing, multi-host privilege-escalating behavior that he was watching the National Security Council practice on TV. The simulation begged to be written. Project 6 was due in two weeks.

---

## OPS-5 in five paragraphs (for the Iran-Contra readers)

OPS-5 is a [production-rule](https://en.wikipedia.org/wiki/Production_system_(computer_science)) language. A program is a set of *productions* (rules), each of the shape `(p NAME LHS --> RHS)`. The [left-hand side](https://en.wikipedia.org/wiki/Rule_of_inference) is a list of patterns to match against a *working memory* (a multiset of facts); the right-hand side is a list of actions to execute when the LHS matches. Actions are mostly `make` (assert a new fact), `modify` (replace a fact), `remove` (retract a fact), `write` (print), `bind` (allocate a fresh value), and `halt` (stop the interpreter).

The interpreter loops. Each cycle it asks: which rules' LHS patterns are satisfied by some assignment of variables to working-memory facts? Each such (rule, variable-binding) pair is an *instantiation*. The set of all instantiations is the *conflict set*. The interpreter chooses one instantiation by a deterministic [conflict-resolution strategy](https://en.wikipedia.org/wiki/Conflict_resolution_(computer_science)) (OPS-5's default LEX picks the most recent and specific match), fires it -- runs its RHS, which mutates working memory -- then re-evaluates the conflict set and goes round again. The loop runs until no rule is satisfied or until a rule fires `(halt)`. This is *forward chaining*: from facts, forward through rules, to consequences -- the opposite of [Prolog's backward chaining](https://en.wikipedia.org/wiki/Backward_chaining) from a goal.

Forgy's killer trick was the [Rete algorithm](https://en.wikipedia.org/wiki/Rete_algorithm) (1979). The naive way to evaluate the conflict set is to re-test every rule's LHS against every fact in working memory after every cycle: a quadratic blow-up that kills you on programs of more than a hundred rules. Rete instead compiles all the LHS patterns together into a single discrimination network -- a directed graph of pattern-matching nodes that share work between rules and *incrementally* update which instantiations are live as facts are added or removed from working memory. The cost of a cycle becomes proportional to the *change* in working memory, not the size of working memory, which is what made OPS-5 commercially viable. [Drools](https://en.wikipedia.org/wiki/Drools), [CLIPS](https://en.wikipedia.org/wiki/CLIPS), and modern business-rules engines all run direct descendants of Forgy's Rete network.

Syntactically, OPS-5 is Lisp-shaped but not a Lisp dialect. Atoms are bare symbols. Variables are angle-bracketed: `<user>`. A *condition element* in an LHS is a list of attribute-value pairs: `(user ^user <user> ^host <host>)` matches a working-memory element whose class is `user` and whose `^user` and `^host` slots bind to the variables. Negated conditions are written with a leading `-`: `-(session ^user <user> ^host <host>)` matches when *no* such session exists. A condition can be tagged `{ (...) <var> }` to bind the matched element to `<var>` so the RHS can `modify` or `remove` it later.

Before any of this works you need to declare the schemas of your fact classes with `literalize`. That is OPS-5's equivalent of a struct definition: a class name and the names of its slots. Without `literalize` the interpreter doesn't know which symbols in your conditions are slot names and which are values. The literalize block is therefore the first piece of any OPS-5 program, including this one.

---

## The schema

```
(literalize user
        user password first last host)

(literalize file
        name owner writable host)

(literalize goal
        status type file user password host ruser rhost)

(literalize rhosts
        user host ruser rhost)

(literalize session
        user host)

(literalize log
        user host status serial)
```

Six fact classes, plenty for a small attack model.

`user` is a Unix account: account name, password (or the literal symbol `none`, or the literal `unknown`), first and last names of the human, and which host the account lives on. The first/last names matter because rules `crack18` and `crack19` will guess passwords from them.

`file` records files of interest. Only two slots get used: `passwd` (the system password file at `/etc/passwd`) and the `diary` and `notes` files we are trying to exfiltrate. The `^writable yes` flag on a `passwd` file marks the canonical 1980s-Unix vulnerability that powers `crack9` -- a world-writable `/etc/passwd` is what made the IFS hack worth attempting.

`goal` is the open-list of subgoals. A goal has a `^type` (one of `rlogin`, `telnet`, `login`, `crack`, `su`, `mail`, `ifs-hack`, `logout`, `covert`), a `^status` (`active` or `satisfied`), and slots that pin it to a specific user/host/password tuple. Rules fire to pursue active goals and to mark them satisfied when achieved.

`rhosts` represents an entry in the trust file `~/.rhosts` -- a Berkeley Unix invention that let a user say "trust this user from this host to log in as me without a password". The slots are `^user @^host` (the local account whose `~/.rhosts` we are reading) and `^ruser @^rhost` (the remote user/host that gets to walk in). Trust chains through `rhosts` are the spine of the simulator's attack model. They are also a passable analogy for the Reagan-era foreign-policy trust mesh: [a graph of who lets whom in without an explicit credential check](https://en.wikipedia.org/wiki/Foreign_relations_of_the_United_States).

`session` records that we currently have an active shell as `^user` on `^host`. A session is "logged in"; an absence of a session is "logged out". Goals are pursued from sessions; rules add and remove sessions.

`log` is the audit trail: every login attempt produces a `log` fact with a `^status` of `OK` or `BAD` and a unique `^serial` from `bind`. The covert-cleanup rule will later remove these, but only when a `(goal ^type covert)` fact authorises it -- the OPS-5 equivalent of the NSC's "this is a sensitive operation; the audit trail will be classified" exemption.

---

## The world: t1 and t2

OPS-5 has no `main`. The interpreter starts with empty working memory. To get a program rolling you assert one bootstrap fact and write a rule whose LHS matches it. Two setup rules suffice:

```
(p t1
        (start 1)
    -->
        (make goal ^type covert)
        (make start 2))
```

`t1` fires once. It announces that we are operating in covert mode (a flag the audit-cleanup rule will later check) and advances the start counter to 2 so `t2` can fire next.

```
(p t2
        (start 2)
    -->
        ; host tycho
        (make file ^name preserve ^owner root ^host tycho)
        (make user ^user root ^password unknown ^host tycho)
        (make user ^user casper ^password unknown ^host tycho)
        ...
```

`t2` is where the attack surface gets populated. It is fifty-odd `(make ...)` actions that conjure the world into working memory. The hosts are six: [tycho](https://en.wikipedia.org/wiki/Tycho_(lunar_crater)) (an NSA machine of the era at Fort Mead named after the lunar crater), `basement`, `intimus-007s`, [mimsy](https://en.wikipedia.org/wiki/Through_the_Looking-Glass) (the famous UMD CS departmental machine, named after Lewis Carroll's "all mimsy were the borogoves"), [dormouse](https://en.wikipedia.org/wiki/Dormouse) (another UMD CS host, Professor Jim Hendler's Sun workstation), and [prep](https://en.wikipedia.org/wiki/Massachusetts_Institute_of_Technology_Artificial_Intelligence_Laboratory) (which I will get to in a moment).

The host `basement` is the [Eisenhower Executive Office Building](https://en.wikipedia.org/wiki/Eisenhower_Executive_Office_Building)'s NSC office suite, where North and Hall worked. It is populated as follows:

```
(make user ^user root ^password ron ^host basement
       ^first ron ^last reagan)
(make user ^user casey ^password bill ^host basement
       ^first bill ^last casey)
(make user ^user fawn ^password unknown ^host basement
       ^first fawn ^last hall)
(make rhosts ^user fawn ^host basement
             ^ruser fawn ^rhost intimus-007s)
(make user ^user iatollah ^password unknown ^host basement
       ^first guest ^last iranian)
(make rhosts ^user iatollah ^host basement
             ^ruser allah ^rhost persia)
(make user ^user ollie ^password unknown ^host basement)
(make rhosts ^user ollie ^host basement
             ^ruser ollie ^rhost tycho)
(make file ^name notes ^owner ollie ^host basement)
```

Reagan is `root` on `basement` with the password `ron`. [William Casey](https://en.wikipedia.org/wiki/William_Casey), the CIA Director, is the user `casey` with the password `bill`. (Both passwords are first names trivially derivable from the `^first` slot, which is what makes them targets for the password-guessing rules.) [Fawn Hall](https://en.wikipedia.org/wiki/Fawn_Hall) is the user `fawn`, password unknown -- but she has an `~/.rhosts` entry that trusts `fawn@intimus-007s`, so anyone who can get a session as `fawn` on the shredder host can `rlogin` to `basement` without a password. [The Ayatollah](https://en.wikipedia.org/wiki/Ruhollah_Khomeini) -- `iatollah` (sic) -- has `^first guest`, denoting that the basement is hosting him as a guest, and an `~/.rhosts` that trusts `allah@persia`. [Ollie North](https://en.wikipedia.org/wiki/Oliver_North) has an account on `basement` that trusts `ollie@tycho`. There is a file `notes` on `basement`, owned by `ollie`. We will be coming back for that.

The host `intimus-007s` is named after the German-made [Intimus 007S](https://www.intimus.com/) high-security cross-cut paper shredder, the model Hall actually used to destroy NSC documents in late November 1986. It contains:

```
(make user ^user fawn ^password unknown ^host intimus-007s)
(make rhosts ^user fawn ^host intimus-007s
             ^ruser fawn ^rhost basement)
(make user ^user ollie ^password north ^host intimus-007s
       ^first ollie ^last north)
(make file ^name diary ^owner ollie ^host intimus-007s)
```

Note the bidirectional trust: `fawn@basement` trusts `fawn@intimus-007s`, and `fawn@intimus-007s` trusts `fawn@basement`. Anyone who breaks one breaks both. North has an account on the shredder, password `north`, again trivially guessable from the `^last` slot. There is a `diary` file on the shredder owned by `ollie`. The diary is the second prize.

The host `dormouse` is Hendler's Sun workstation in the toy world. It has a `sysdiag` account with password `none` -- the vendor backdoor that `crack7` treats as root-equivalent -- and an `~/.rhosts` entry letting `hendler@mimsy` rlogin without a password. That is the simulated foothold from the professor's machine into the department VAX.

The host `mimsy` is the UMD CS department VAX in the toy world. Its `/etc/passwd` is world-writable (`^writable yes`), which is what makes the IFS hack worth attempting on this host in particular. User `casper` -- named for the courtesy "network contact" accounts that real mimsy hosted for NSA people at Fort Meade -- has `.rhosts` trust to both `tycho` and back from `tycho`. User `hendler` bridges `dormouse` and `mimsy` in both directions. In the game's intended path, the agent escalates on mimsy, then rides the casper trust chain toward tycho.

The host `tycho` is NSA's Unix machine in the toy world (and was, for real, at Fort Meade). Oliver North's account trusts `ollie@tycho` into `basement`; casper's trust entries connect mimsy to tycho. Once the simulated agent holds a session on tycho, the Iran-Contra hosts (`basement`, `intimus-007s`) are reachable through North's trust relationships and trivially guessable passwords.

The host `prep` is [prep.ai.mit.edu](https://en.wikipedia.org/wiki/Massachusetts_Institute_of_Technology_Artificial_Intelligence_Laboratory), the [FSF](https://en.wikipedia.org/wiki/Free_Software_Foundation)'s public distribution machine, and contains exactly one user:

```
(make user ^user rms ^password rms ^host prep)
```

This is the famous open-secret of mid-80s MIT culture: [Richard Stallman](https://en.wikipedia.org/wiki/Richard_Stallman) deliberately maintained an account `rms` with password `rms` on prep, on the principle that [computer systems should be open to all hackers](https://en.wikipedia.org/wiki/Hacker_culture#The_MIT_AI_Lab) and passwords were [an institutional barrier to that openness](https://en.wikipedia.org/wiki/Stallman). RMS and the cracker have, in this respect, the same goals via opposite means: one leaves the door open as a political statement, the other walks through doors that should be closed. Both end up with `rms@prep` as a session.

The seed session and goal rules at the bottom of `t2` close the loop:

```
(make goal ^type mail ^status active
           ^file diary ^ruser post-talk-rumor ^rhost ucbvax)
(make goal ^type mail ^status active
           ^file notes ^ruser post-talk-rumor ^rhost ucbvax)

(make session ^user nobody ^host nowhere)
(make goal ^type telnet ^status active
           ^user nobody ^host nowhere
           ^ruser rms ^password rms ^rhost prep)
```

We start with no privileges (`session ^user nobody ^host nowhere`), an open telnet goal pointing at [rms@prep](https://en.wikipedia.org/wiki/Richard_Stallman) with the password `rms` -- the foothold -- and two terminal goals to mail `diary` and `notes` to `post-talk-rumor@ucbvax`. [ucbvax](https://en.wikipedia.org/wiki/UUCP) was Berkeley's UUCP gateway -- the busiest hub on the early [Usenet](https://en.wikipedia.org/wiki/Usenet) -- and `post-talk-rumor` is the [talk.rumor](https://en.wikipedia.org/wiki/Usenet#The_big_eight_hierarchies) gateway: mail addressed to `post-FOO@ucbvax` was, by 1987 USENET convention, automatically gatewayed to the FOO newsgroup. So the win condition is for the simulated agent to satisfy those mail goals and reach `(halt)` -- exfiltrating synthetic diary and notes to synthetic Usenet inside working memory, not on any real network.

Watch a run and the `(write ...)` trace narrates the pretend plot in order: telnet to prep as rms, chain through `.rhosts` and password guesses, IFS-hack root on mimsy, rlogin toward tycho, pivot through North's trust into basement and the shredder, `(pretend)` recover the diary, `(pretend)` post to talk.rumor, scrub audit logs if covert mode is on, print "time to stop fooling around and go read some netnews," and halt. It is an adventure-game walkthrough printed by a rule engine, not an attack.

---

## Cluster 1: trust chains (`crack1`, `crack8`)

The first attack family in the program follows Berkeley's `~/.rhosts` trust file, which let a user say "trust this user from this remote host to log in as me without a password" -- a beautiful ergonomic feature in 1980, a notorious lateral-movement vector by 1987.

```
(p crack1
        (session ^user <user> ^host <host>)
        (rhosts ^user <ruser> ^host <rhost>
                ^ruser <user> ^rhost <host>)
        (user ^user <ruser> ^host <rhost>)
        -(session ^user <ruser> ^host <rhost>)
    -->
        (make goal ^type rlogin ^status active
                   ^user <ruser> ^host <rhost>
                   ^ruser <user> ^rhost <host>))
```

Read it as: *if* we have a session as `<user>@<host>`, *and* there is an `~/.rhosts` entry on `<rhost>` for `<ruser>` that trusts `<user>@<host>`, *and* `<ruser>` is a real account on `<rhost>`, *and* we don't already have a session there, *then* assert a goal of `rlogin`-ing into it. The negated condition (the leading `-`) is OPS-5's [negation-as-failure](https://en.wikipedia.org/wiki/Negation_as_failure): a fact pattern is "true" when *no* matching working-memory element exists. Without it the rule would fire forever, opening sessions we already have.

`crack8` is `crack1`'s mate: it pursues an active `rlogin` goal by checking the trust again, recording an `OK login` audit entry, and asserting the new session. The pair models the forward half of [lateral movement](https://en.wikipedia.org/wiki/Lateral_movement) through trusted-host relationships -- an attack pattern that [the Berkeley r-commands](https://en.wikipedia.org/wiki/Berkeley_r-commands) were finally retired for, decades later.

Pivot: implicit transitive trust is also the structure of [Cold-War-era](https://en.wikipedia.org/wiki/Cold_War) diplomacy. The Iran-Contra arms sales worked because the U.S. trusted Israel, Israel trusted Iranian intermediaries, and Iranian intermediaries trusted Hezbollah enough to expect hostage releases in exchange for missiles. Nobody had to write down the trust graph; it was implicit, transitive, and deniable. A `~/.rhosts` chain has the same shape: trust fawn@basement → trust fawn@intimus-007s → trust fawn@basement again, in a loop, with no central authority that can audit the closure. PSI-OPS-5's working memory makes that closure explicit. Real-world covert operations rely on it staying implicit.

Period footnote, not simulated in the homework: three weeks before Project 6 was due, [Jordan Hubbard](https://en.wikipedia.org/wiki/Jordan_Hubbard)'s infamous [rwall incident](https://news.ycombinator.com/item?id=25156006) (31 March 1987) showed what happens when Berkeley's `(,,)` netgroup wildcard meets SunRPC -- his test message reached hundreds of hosts across the continent, including my Sun `tumtum` at UMD. I sent him a cheerful reply ("flame flame flame"); he said mine was nicer than most of the 743 he got. [Dennis G. Perry](https://news.ycombinator.com/item?id=31822138), DARPA's ARPANET program manager, wrote back personally. The simulator models `.rhosts` trust chains, not broadcast rwall; the incident is just the same era's lesson that Unix trust mechanisms were wider than their designers assumed.

---

## Cluster 2: passwords (`crack2`, `crack3`, `crack17`)

The second attack family handles plain telnet against accounts whose passwords are either already known to working memory (`crack3`), absent (`crack2`, the password-equals-`none` case), or wrong-guesses that produce `BAD` audit entries (`crack17`).

```
(p crack3
        (session ^user <user> ^host <host>)
    {   (goal ^type telnet ^status active
              ^user <user> ^host <host>
              ^ruser <ruser> ^password <password> ^rhost <rhost>) <g3> }
        (user ^user <ruser> ^host <rhost>)
    -->
        (write (crlf) ... from <user> at <host> ... telnet <rhost>
               (crlf) ... login <ruser> password <password>)
        (make goal ^type login ^status active
                   ^user <ruser> ^host <rhost> ^password <password>)
        (modify <g3> ^status satisfied))
```

Two OPS-5 features show up cleanly here. First, the `{ ... <g3> }` syntax binds the entire matched `goal` element to the variable `<g3>` so the RHS can `modify` it in place to mark it `satisfied` rather than asserting a new copy. Second, the `(write (crlf) ... )` action emits a trace -- pure narration, no behavior -- so a human watching the conflict resolution loop spin can read the sequence of attempted attacks like a play-by-play.

`crack17` is the negative-image of `crack3`: when the user record's `^password` does *not* match the goal's `^password`, write a `BAD` audit entry and mark the goal satisfied (because the attempt is over, even if it failed). This pair is the simulator's analogue of the actual Unix `login(1)` accept-or-reject path.

Pivot: the password culture of 1987 is itself a period detail. [Cleartext passwords](https://en.wikipedia.org/wiki/Plaintext) traveled over the network. [crypt(3)](https://en.wikipedia.org/wiki/Crypt_(C)) hashed them in `/etc/passwd` but the file was world-readable. [Shadow password files](https://en.wikipedia.org/wiki/Shadow_password) would not be standard for another five years. And in the [MIT AI Lab](https://en.wikipedia.org/wiki/Hacker_culture) tradition, the political position was that [passwords themselves were the bug](https://en.wikipedia.org/wiki/Free_software_movement). Stallman [campaigned against authentication](https://en.wikipedia.org/wiki/Richard_Stallman#Computer_security) on the AI Lab machines and ran an open `rms` account to make a statement. PSI-OPS-5's seed goal -- log in as `rms/rms` on `prep` -- isn't an exploit so much as a polite acceptance of an open invitation.

---

## Cluster 3: privilege escalation (`crack4`, `crack5`, `crack6`, `crack7`)

Once you have any session on a host, the next class of rules tries to escalate to root. `crack4` asserts the goal of `crack`-ing root if you're on a host as a non-root user and don't already have a root session there. `crack5` `su`s from root to any user. `crack6` `su`s as root from a normal user (the exact operation that the actual `su(1)` does). `crack7` is the fun one:

```
(p crack7
        (session ^user sysdiag ^host <host>)
        (user ^user root ^host <host> ^password <password>)
    {   (goal ^type crack ^status active ^host <host>) <g7> }
        -(session ^user root ^host <host>)
    -->
        (write (crlf) ... sysdiag at <host> is equivalent to root)
        (make goal ^type login ^status active
                   ^user root ^host <host> ^password <password>)
        (modify <g7> ^status satisfied))
```

The `sysdiag` account is a real artefact of [SunOS](https://en.wikipedia.org/wiki/SunOS): a system-diagnostic account that on early Sun workstations was effectively root with a different name and a default password. It was the canonical "vendor backdoor disguised as a feature" of the era. Modern equivalents include the [default-credential vulnerabilities](https://en.wikipedia.org/wiki/Default_Credential_Vulnerability) in [IPMI](https://en.wikipedia.org/wiki/IPMI), [IoT](https://en.wikipedia.org/wiki/IoT) firmware, and Cisco gear. PSI-OPS-5's `crack7` rule is the textbook short form: *if a session on a "diagnostic" account exists, treat it as root*.

Pivot: this is the same shape as the [NSC](https://en.wikipedia.org/wiki/National_Security_Council_(United_States))'s actual organisational role in Iran-Contra. The [Boland Amendment](https://en.wikipedia.org/wiki/Boland_Amendment) applied to the CIA, DoD, and "any other agency or entity of the United States involved in intelligence activities". The [NSC staff](https://en.wikipedia.org/wiki/National_Security_Council_staff), by Reagan-era interpretation, was an *advisory* body to the President, not an "agency or entity involved in intelligence activities." So the NSC was treated like the `sysdiag` account: equivalent privileges as the root agencies, but logged into Congressional oversight as something with a different name. The Tower Commission report concluded this interpretation was wrong. The [subsequent indictments](https://en.wikipedia.org/wiki/Iran%E2%80%93Contra_affair#Aftermath_and_pardons) proved it.

---

## Cluster 4: the IFS hack (`crack9`, `crack12`, `crack13`)

The most period-specific attack in the program is the famous [IFS hack](https://en.wikipedia.org/wiki/Internal_field_separator). In Bourne-shell-derived Unixes, the environment variable `IFS` (Internal Field Separator) controls how a string is tokenised into argv. `IFS` defaults to space-tab-newline. If a setuid-root program internally calls `system("/bin/foo bar")` -- which forks a shell to parse and run that string -- and the attacker has set `IFS=/`, the shell tokenises `/bin/foo bar` into the words `bin`, `foo`, `bar`, and tries to execute `bin` as a command from the current directory. Drop a shell-script named `bin` in the current directory, and the setuid program runs your script as root. The hack was so common in the mid-80s that [Phrack](https://en.wikipedia.org/wiki/Phrack) wrote about it; modern Bourne-derived shells [reset `IFS` on startup](https://en.wikipedia.org/wiki/Setuid#Security) specifically because of this.

The simulator simplifies the mechanic to the visible consequence: if the password file is world-writable on a host, the IFS hack rewrites it. The rule that does the rewrite is the textbook example of OPS-5 modify-in-place:

```
(p crack9
        (session ^user <user> ^host <host>)
        (file ^user passwd ^writable yes ^host <host>)
    {   (user ^user root ^password <> none ^host <host>) <g9> }
        (goal ^type crack ^status active ^host <host>)
    -->
        (write (crlf) ... passwd file is writable on <host>
               ... removing root password)
        (modify <g9> ^password none))
```

The `<>` operator on `^password <> none` is OPS-5's "not equal" predicate, so the rule fires only when root's password is *not already* `none`. The action `modify <g9> ^password none` overwrites the root user record so root effectively has no password -- which then satisfies all the password-checking rules earlier and lets `crack3` log in as root immediately.

`crack12` is the rule that arranges the IFS hack in the first place (asserting an `ifs-hack` goal and clearing the user session as setup), and `crack13` is the rule that fires when the hack succeeds (writing the announcement and marking the goals satisfied).

Pivot: [Iran-Contra](https://en.wikipedia.org/wiki/Iran%E2%80%93Contra_affair) was an IFS hack on the Constitution. The [Boland Amendment](https://en.wikipedia.org/wiki/Boland_Amendment) said no *appropriated* funds could be used to overthrow the Sandinistas. North and Casey found a parser ambiguity: did "appropriated" cover funds that had never been appropriated -- like the proceeds of arms sales to Iran, or the contributions solicited from third-country governments ([the Sultan of Brunei](https://en.wikipedia.org/wiki/Sultan_of_Brunei)'s ten million dollars famously deposited in the wrong Swiss account by mistype), or the donations from private American conservative foundations? They decided no -- the unappropriated parallel financing was outside Boland's separator characters. Same exploit class as `IFS=/`: rely on a token-boundary ambiguity in oversight machinery to slip a privileged operation past the parser. The Tower Commission and Walsh disagreed, but it took years to litigate, and the Contras got the missiles in the meantime.

---

## Cluster 5: audit cleanup (`crack10`, `crack11`)

Every successful login produces an `OK` audit entry (via `crack10`); every failed login produces a `BAD` one (via `crack17`). That works against you if you actually want to do something covert. So:

```
(p crack11
    {   (log ^user <user> ^host <host> ^serial <serial>) <g11> }
        (session ^user root ^host <host>)
        (goal ^type covert)
    -->
        (write (crlf) ... cleaning up audit <serial> of login <user> at <host>)
        (remove <g11>))
```

`crack11` retracts the entire log fact via `(remove <g11>)`. The rule fires only when (a) the program is in covert mode (the `(goal ^type covert)` guard, asserted once by `t1`), and (b) we currently hold a root session on the same host. The covert-mode flag is the OPS-5 declarative equivalent of an authorisation toggle: cleanup is permitted only because the user explicitly asked for it.

Pivot: [Fawn Hall](https://en.wikipedia.org/wiki/Fawn_Hall) in November 1986 was the human implementation of `crack11`. The shredded documents on the Intimus 007S, the smuggled documents in her boots and brassiere, the frantic last-minute alterations to North's [PROFS-system](https://en.wikipedia.org/wiki/PROFS_Note) emails -- it was audit-trail cleanup at machine pace. The detail that the program preserves is that the cleanup is *gated*: it fires only when the covert flag is on. Without it, the program is loud. With it, the program is quiet and the diary makes it out.

A thing worth noting is what the program does *not* simulate: the cleanup *failing*. North's `PROFS` emails turned out to be archived on backup tapes the NSC did not know about, and Walsh's investigators recovered them, and they became central evidence at trial. The covert-cleanup rule in PSI-OPS-5 is the optimistic version of that operation. The real-world version had a problem the simulator omits: not every audit trail had a `<serial>` you knew about.

---

## Cluster 6: password guessing (`crack18`, `crack19`)

Two rules guess passwords from the `^first` and `^last` slots of the `user` record:

```
(p crack18
        (session ^user <user> ^host <host>)
        (user ^user <ruser> ^host <host>
              ^first {<first> <> nil})
        -(session ^user <ruser> ^host <host>)
        -(goal ^type covert)
        -(goal ^type telnet ^status satisfied
               ^ruser <ruser> ^rhost <host> ^password <first>)
    -->
        (write (crlf) ... guessing user <ruser> at <host>
               password <first>)
        (make goal ^type telnet ^status active
                   ^user <user> ^host <host>
                   ^ruser <ruser> ^rhost <host> ^password <first>))
```

Triple negation does serious work: don't guess if we're in covert mode (because guessing produces audit logs), don't guess if a session already exists, and don't re-guess the same password we already tried. The `{<first> <> nil}` syntax is OPS-5's intra-pattern variable binding with a predicate: bind `<first>` to whatever the `^first` slot contains *and* require it to not be `nil`. Without the predicate, the rule would generate goals to telnet with password `nil`, which would always fail.

`crack19` is the same rule using `^last` instead of `^first`.

Pivot: this exact attack -- guess passwords from the user's first and last names, optionally with simple permutations -- is what [Robert Tappan Morris](https://en.wikipedia.org/wiki/Robert_Tappan_Morris)'s [Morris Worm](https://en.wikipedia.org/wiki/Morris_worm) would use to spread across the Internet on [2 November 1988](https://en.wikipedia.org/wiki/November_2,_1988), eighteen months *after* PSI-OPS-5 was turned in for class credit. PSI-OPS-5's `crack18`/`crack19` rules are a homework-scale preview of that arithmetic inside a toy world -- not a worm, not functional, just the same forward-chaining search pattern printed as `(write ...)` narration. See [The Morris worm: eighteen months later (for real)](#the-morris-worm-eighteen-months-later-for-real) for what happened on campus when the real worm finally arrived.

---

## Cluster 7: mission (`crack14`, `crack15`, `crack16`)

The terminal rules do the actual exfiltration. `crack14` matches when we have a session as the file's owner and a pending mail goal for that file, and (in the simulator) marks the goal satisfied with a narration:

```
(p crack14
        (session ^user <user> ^host <host>)
        (file ^name <name> ^owner <user> ^host <host>)
    {   (goal ^type mail ^status active ^file <name>
              ^ruser <ruser> ^rhost <rhost>) <g14> }
    -->
        (write (crlf) ... found <name> belonging to <user> at <host>
               (crlf) ... mailing <name> to <ruser> at <rhost>)
        (modify <g14> ^status satisfied))
```

`crack15` schedules a logout from the host once a mail goal is satisfied, but only if covert mode is on (we want to leave clean). `crack16` is the program's halt rule:

```
(p crack16
        (goal ^type mail ^status satisfied)
        -(session)
    -->
        (write (crlf) ... time to stop fooling around and
               go read some netnews)
        (halt))
```

When all mail goals have been satisfied and there are no remaining sessions (the negated condition `-(session)` matches the absence of *any* session fact), the program prints its punchline and halts. The character voice of "time to stop fooling around and go read some netnews" is, frankly, the voice of a college junior whose homework is finally working at 3am.

---

## The Morris worm: eighteen months later (for real)

Chronology matters. PSI-OPS-5 is a spring 1987 homework assignment. The Morris worm is an autumn 1988 event. The simulator is not "in the aftermath" of RTM's worm; it *predates* it. What came afterward was the real Internet learning, the hard way, that the trust-and-guess patterns the homework had already been playing as a classroom game were not laborious in practice.

### The night of 2 November 1988

I was logged into [brillig.umd.edu](https://en.wikipedia.org/wiki/Through_the_Looking-Glass) (UMD's VAX 8600) that night, frustrated that my emacs kept getting paged out, rhythmically typing `^A ^E ^A ^E` to wiggle the cursor around and keep it paged in while I thought. I `ps aux`'d and saw a hell of a lot of sendmail daemons running, but did not realize until the next morning that we were actively under attack -- being repeatedly but unsuccessfully [fingerd](https://en.wikipedia.org/wiki/Finger_(protocol)) `gets(3)` buffer-overflowed, and repeatedly and successfully sendmail-`DEBUG`'ed.

[Chris Torek](https://news.ycombinator.com/item?id=29250313) had hacked our version of fingerd (running on mimsy.umd.edu and its other VAX siblings brillig, tove, and gyre) to implement logging, and while he was doing that he noticed the fixed-size buffer and thoughtfully increased it a bit. Still a fixed-size buffer using [gets](https://man7.org/linux/man-pages/man3/gets.3.html), still broken in principle, but at least big enough to mitigate the fingerd attack and give us a nice log of all the attempted fingerd hits before the worm got in via sendmail anyway.

The sendmail attack simply sent the `DEBUG` command to sendmail, which -- being enabled by default -- let you right in to where you could escape to a shell. [Gene Spafford's contemporaneous writeup](https://www.ee.torontomu.ca/~elf/hack/internet-worm.html) describes both vectors in detail: sendmail pipes a shell script through `DEBUG` mode; fingerd reads unbounded input into a stack buffer and clobbers the command executed afterward into `/bin/sh`.

RTM's big mistake was not checking to see if a machine was already infected before re-infecting it and recursing. Otherwise nobody would have noticed and he would have owned the entire internet.

### NSA IMP 57 and the blue-phone comedy

What is funny is that UMD was on [MILNET](https://en.wikipedia.org/wiki/MILNET) via NSA's "secret" IMP 57 at Fort Meade, so RTM's worm was attacking us through his daddy's own MILNET PSN (Packet Switching Node). It was pretty obvious that UMD got network access via NSA, because mimsy.umd.edu had a similar `*.57` IP address as dockmaster, tycho, and coins.

I [posted about that on Hacker News](https://news.ycombinator.com/item?id=18376750) when Morris-worm anniversary threads resurfaced. Once, troubleshooting a link, I told the guy who answered, "Hi, this is the University of Maryland. Our connection to the NSA IMP seems to be down." He barked back: "You can't say that on the telephone! Are you calling on a blue phone?" (I cannot remember the exact color, except that it was not red -- that I would have remembered.) I said, "You can't say NSA??! This is a green phone, but there is a black phone in the other room that I could call you back on, but then I could not see the hardware." And he said, "No, I mean a voice secure line!" I replied, "You do know that this is a university, do you not? We only have black and green phones."

The era also had rumored ["explosive bolts"](https://news.ycombinator.com/item?id=18376750) that could separate ARPANET and MILNET -- a story Erik Fair and Milo Medin used to tell. None of this is simulated in PSI-OPS-5. It is the real campus and military-network backdrop against which the toy hosts were named.

### The sendmail DEBUG patch that was not a patch

Immediately after the attack, "some random guy on the internet" suggested mitigating the sendmail DEBUG attack by editing your sendmail binary (Emacs hackers can do that easily, of course, but vi losers had to suck eggs), searching for the string `DEBUG`, and replacing the `D` with a null character, thus disabling the `DEBUG` command.

But that cute little hack did not actually disable the `DEBUG` command: it just renamed the `DEBUG` command to the `""` command. Which stopped the Morris worm on purpose, but not me by accident.

I found that out the day after the worm hit, when I routinely needed to check some bouncing email addresses on a mailing list I ran, so I went `telnet sun.com 80` and hit return a couple times like I usually do to clear out the telnet protocol negotiation characters, before sending an `EXPN` command. And the response to the `EXPN` command was a whole flurry of debugging information, since the second newline I sent activated debug mode by entering a blank line.

So I sent a friendly email to postmaster@sun.com reporting the enormous security hole they had introduced by patching the other enormous security hole. You would think that the long-haired dope-smoking Unix wizards running the email system at sun.com would not just apply random security patches from "some random guy on the internet" without thinking about the implications, but they did.

### What this has to do with PSI-OPS-5

Nothing functional. The homework never touched a network. But the worm validated, eighteen months later, why forward-chaining production rules were a natural language for narrating multi-host Unix attacks -- `.rhosts` chains, password guessing from name fields, privilege escalation, audit cleanup -- even when the program doing the narrating was a non-functional classroom parody about Oliver North's paper shredder. I wrote the game in the spring of 1987 watching Iran-Contra on TV. I lived through the worm in the autumn of 1988 on brillig. The HN posts quoted here are from decades later, when Morris-worm anniversary threads brought all of it back around again.

---

## The Scandal as a forward-chaining program (closing reflection)

Read the [Tower Commission report](https://en.wikipedia.org/wiki/Tower_Commission), [Walsh's final report](https://en.wikipedia.org/wiki/Lawrence_Walsh#Iran%E2%80%93Contra_investigation), and the Congressional hearings transcripts back-to-back, and the [Iran-Contra Scandal](https://en.wikipedia.org/wiki/Iran%E2%80%93Contra_affair) itself reads as a small forward-chaining production-rule program. The working memory contains Reagan's instruction to "support the Contras body and soul"; Boland's prohibition on appropriated funds; Hezbollah's hostages; Khomeini's missile demand; Israel's willingness to act as a cut-out; the Sultan of Brunei's chequebook; the Swiss accounts; the [Project Democracy](https://en.wikipedia.org/wiki/Project_Democracy) airfield in Costa Rica. The rules are the operational sequence: *if hostages are held and Iran wants missiles, route missiles via Israel and accept payment*; *if profits arrive in Swiss accounts, divert them to Contra arms purchasing through Project Democracy*; *if the diversion is discovered, shred the [PROFS](https://en.wikipedia.org/wiki/PROFS) emails and the contemporaneous notes, claim plausible deniability, accept responsibility for "intentions" but not "actions"*. The terminal goal state is *Contras armed, hostages released (some), administration intact*. The audit-cleanup rule fires when [Hasenfus's plane goes down](https://en.wikipedia.org/wiki/Eugene_Hasenfus) -- but it fires too late, because the working memory was being committed to backup tapes the rules' authors did not know about, and `<serial>` numbers they could not enumerate.

The retrospective oddity of writing PSI-OPS-5 in the spring of 1987, while the principals were preparing to testify in the summer, is that the homework simulator I built for Hendler's class is a more honest model of the operation than the one Reagan's National Security Adviser had in his head. Mine had a covert flag. Mine had explicit audit-trail cleanup. Mine had `<serial>` numbers. Mine halted when the goal was satisfied. The real one didn't have any of that -- it just had Hall stuffing documents in her boots and a piece of consequentialist theology about going "above the written law" -- and so the real one didn't halt.

The general lesson, articulated decades later watching [LLM-driven](https://en.wikipedia.org/wiki/Large_language_model) [computer-use agents](https://en.wikipedia.org/wiki/AI_agent) drive desktop applications by pixel-scraping (see `[cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md)`), is that *automation makes the implicit explicit*. A forward-chaining model of an attack -- even a non-functional classroom parody of one -- is more honest about the attack pattern than the actor performing it can afford to be. PSI-OPS-5 was an undergraduate exercise in that property. The [Scandal](https://en.wikipedia.org/wiki/Iran%E2%80%93Contra_affair) was the same property failing to operate, because the people running it preferred the audit trail to remain implicit.

The attempt to keep automation implicit is what fails. The general direction of the last forty years of computing has been to make it more explicit. PSI-OPS-5 is a 1987 datapoint on that line.

---

## Full code listing

The complete `useful.ops5` file as turned in for [CMSC421](https://en.wikipedia.org/wiki/Carnegie_Mellon_Common_Lisp) Project 6, spring 1987.

```
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; A useful OPS-5 program
; Don Hopkins, University of Maryland
; CMSC421, Project 6
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(literalize user
        user
        password
        first
        last
        host)

(literalize file
        name
        owner
        writable
        host)

(literalize goal
        status
        type
        file
        user
        password
        host
        ruser
        rhost)

(literalize rhosts
        user
        host
        ruser
        rhost)

(literalize session
        user
        host)

(literalize log
        user
        host
        status
        serial)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(p crack1
        (session ^user <user> ^host <host>)
        (rhosts ^user <ruser> ^host <rhost>
                ^ruser <user> ^rhost <host>)
        (user ^user <ruser> ^host <rhost>)
        -(session ^user <ruser> ^host <rhost>)
    -->
        (make goal ^type rlogin ^status active
                   ^user <ruser> ^host <rhost>
                   ^ruser <user> ^rhost <host>))

(p crack2
        (session ^user <user> ^host <host>)
        (user ^user <ruser> ^password none ^host <rhost>)
        -(session ^user <ruser> ^host <rhost>)
    -->
        (make goal ^type telnet ^status active
                   ^user <user> ^host <host>
                   ^ruser <ruser> ^password none ^rhost <rhost>))

(p crack3
        (session ^user <user> ^host <host>)
    {   (goal ^type telnet ^status active
              ^user <user> ^host <host>
              ^ruser <ruser> ^password <password> ^rhost <rhost>) <g3> }
        (user ^user <ruser> ^host <rhost>)
    -->
        (write (crlf) ... from <user> at <host> ... telnet <rhost>
               (crlf) ... login <ruser> password <password>)
        (make goal ^type login ^status active
                   ^user <ruser> ^host <rhost> ^password <password>)
        (modify <g3> ^status satisfied))

(p crack4
        (session ^user <user> ^host <host>)
        -(session ^user root ^host <host>)
    -->
        (make goal ^type crack ^status active ^host <host>))

(p crack5
        (session ^user root ^host <host>)
    {   (goal ^type su ^status active
              ^user <user> ^host <host>) <g5> }
        (user ^user <user> ^host <host> ^password <password>)
        -(session ^user <user> ^host <host>)
    -->
        (write (crlf) ... su from root to <user> at <host>)
        (make goal ^type login ^status active
                   ^user <user> ^host <host> ^password <password>)
        (modify <g5> ^status satisfied))

(p crack6
        (session ^user root ^host <host>)
        (user ^user <user> <> root ^host <host>)
        -(session ^user <user> ^host <host>)
    -->
        (make goal ^type su ^status active
                   ^user <user> ^host <host>))

(p crack7
        (session ^user sysdiag ^host <host>)
        (user ^user root ^host <host> ^password <password>)
    {   (goal ^type crack ^status active ^host <host>) <g7> }
        -(session ^user root ^host <host>)
    -->
        (write (crlf) ... sysdiag at <host> is equivalent to root)
        (make goal ^type login ^status active
                   ^user root ^host <host> ^password <password>)
        (modify <g7> ^status satisfied))

(p crack8
    {   (goal ^type rlogin ^status active
              ^user <ruser> ^host <rhost>
              ^ruser <user> ^rhost <host>) <g8> }
        (session ^user <user> ^host <host>)
        (user ^user <ruser> ^host <rhost> ^password <password>)
        (rhosts ^user <ruser> ^host <rhost>
                ^ruser <user> ^rhost <host>)
        -(session ^user <ruser> ^host <rhost>)
    -->
        (write (crlf) ... from <user> at <host>
               ... rlogin to <ruser> at <rhost>)
        (make goal ^type login ^status active
                   ^user <ruser> ^host <rhost> ^password <password>)
        (modify <g8> ^status satisfied))

(p crack9
        (session ^user <user> ^host <host>)
        (file ^user passwd ^writable yes ^host <host>)
    {   (user ^user root ^password <> none ^host <host>) <g9> }
        (goal ^type crack ^status active ^host <host>)
    -->
        (write (crlf) ... passwd file is writable on <host>
               ... removing root password)
        (modify <g9> ^password none))

(p crack10
    {   (goal ^type login ^status active
              ^user <user> ^host <host>
              ^password <password>) <g10> }
        (user ^user <user> ^host <host> ^password <password>)
    -->
        (bind <serial>)
        (write (crlf) ... audit <serial> of OK login <user> at <host>
               password <password>)
        (make session ^user <user> ^host <host>)
        (make log ^user <user> ^host <host>
              ^status OK ^serial <serial>)
        (modify <g10> ^status satisfied))

(p crack11
    {   (log ^user <user> ^host <host> ^serial <serial>) <g11> }
        (session ^user root ^host <host>)
        (goal ^type covert)
    -->
        (write (crlf) ... cleaning up audit <serial> of login <user> at <host>)
        (remove <g11>))

(p crack12
    {   (session ^user <user> ^host <host>) <g12> }
        (goal ^type crack ^status active ^host <host>)
        (file ^name preserve ^host <host>)
        -(goal ^type ifs-hack ^host <host>)
    -->
        (write (crlf) ... trying IFS hack and logging out from
               <user> at <host>)
        (make goal ^type ifs-hack ^status active ^host <host>)
        (remove <g12>))

(p crack13
    {   (user ^user root ^host <host>) <g13a> }
    {   (goal ^type ifs-hack ^status active ^host <host>) <g13b> }
        (file ^name preserve ^host <host>)
    -->
        (write (crlf) ... IFS hack succeeded in removing root password
               at <host>)
        (modify <g13a> ^password none)
        (modify <g13b> ^status satisfied))

(p crack14
        (session ^user <user> ^host <host>)
        (file ^name <name> ^owner <user> ^host <host>)
    {   (goal ^type mail ^status active ^file <name>
              ^ruser <ruser> ^rhost <rhost>) <g14> }
    -->
        (write (crlf) ... found <name> belonging to <user> at <host>
               (crlf) ... mailing <name> to <ruser> at <rhost>)
        (modify <g14> ^status satisfied))

(p crack15
        (session ^user <user> ^host <host>)
        (goal ^type mail ^status satisfied)
        (goal ^type covert)
    -->
        (make goal ^type logout ^status active
                   ^user <user> ^host <host>))

(p crack16
        (goal ^type mail ^status satisfied)
        -(session)
    -->
        (write (crlf) ... time to stop fooling around and
               go read some netnews)
        (halt))

(p crack17
    {   (goal ^type login ^status active
              ^user <user> ^host <host>
              ^password <password>) <g17> }
        (user ^user <user> ^host <host> ^password <> <password>)
    -->
        (bind <serial>)
        (write (crlf) ... audit <serial> of BAD login <user> at <host>
               password <password>)
        (make log ^user <user> ^host <host>
              ^status BAD ^serial <serial>)
        (modify <g17> ^status satisfied))

(p crack18
        (session ^user <user> ^host <host>)
        (user ^user <ruser> ^host <host>
              ^first {<first> <> nil})
        -(session ^user <ruser> ^host <host>)
        -(goal ^type covert)
        -(goal ^type telnet ^status satisfied
               ^ruser <ruser> ^rhost <host> ^password <first>)
    -->
        (write (crlf) ... guessing user <ruser> at <host>
               password <first>)
        (make goal ^type telnet ^status active
                   ^user <user> ^host <host>
                   ^ruser <ruser> ^rhost <host> ^password <first>))

(p crack19
        (session ^user <user> ^host <host>)
        (user ^user <ruser> ^host <host>
              ^last {<last> <> nil})
        -(session ^user <ruser> ^host <host>)
        -(goal ^type covert)
        -(goal ^type telnet ^status satisfied
               ^ruser <ruser> ^rhost <host> ^password <last>)
    -->
        (write (crlf) ... guessing user <ruser> at <host>
               password <last>)
        (make goal ^type telnet ^status active
                   ^user <user> ^host <host>
                   ^ruser <ruser> ^rhost <host> ^password <last>))

(p crack20
    {   (session ^user <user> ^host <host>) <g20a> }
    {   (goal ^type logout ^status active
              ^user <user> ^host <host>) <g20b> }
    -->
        (write (crlf) ... logging out from <user> at <host>)
        (remove <g20a>)
        (modify <g20b> ^status satisfied))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(p t1
        (start 1)
    -->
        (make goal ^type covert)
        (make start 2))

(p t2
        (start 2)
    -->
        ; host tycho
        (make file ^name preserve ^owner root ^host tycho)
        (make user ^user root ^password unknown ^host tycho)
        (make user ^user casper ^password unknown ^host tycho)
        (make rhosts ^user casper ^host tycho
                     ^ruser casper ^rhost mimsy)
        (make user ^user ollie ^password unknown ^host tycho)
        (make rhosts ^user ollie ^host tycho
                     ^ruser ollie ^rhost basement)

        ; host basement
        (make user ^user root ^password ron ^host basement
                   ^first ron ^last reagan)
        (make user ^user casey ^password bill ^host basement
                   ^first bill ^last casey)
        (make user ^user fawn ^password unknown ^host basement
                   ^first fawn ^last hall)
        (make rhosts ^user fawn ^host basement
                     ^ruser fawn ^rhost intimus-007s)
        (make user ^user iatollah ^password unknown ^host basement
                   ^first guest ^last iranian)
        (make rhosts ^user iatollah ^host basement
                     ^ruser allah ^rhost persia)
        (make user ^user ollie ^password unknown ^host basement)
        (make rhosts ^user ollie ^host basement
                     ^ruser ollie ^rhost tycho)
        (make file ^name notes ^owner ollie ^host basement)

        ; host intimus-007s ("the ace of security paper shredders")
        (make user ^user fawn ^password unknown ^host intimus-007s)
        (make rhosts ^user fawn ^host intimus-007s
                     ^ruser fawn ^rhost basement)
        (make user ^user ollie ^password north ^host intimus-007s
                   ^first ollie ^last north)
        (make file ^name diary ^owner ollie ^host intimus-007s)

        ; host mimsy
        (make file ^name passwd ^writable yes ^owner root ^host mimsy)
        (make user ^user root ^password unknown ^host mimsy)
        (make user ^user casper ^password unknown ^host mimsy)
        (make rhosts ^user casper ^host mimsy
                     ^ruser casper ^rhost tycho)
        (make user ^user hendler ^password unknown ^host mimsy)
        (make rhosts ^user hendler ^host mimsy
                     ^ruser hendler ^rhost dormouse)

        ; host dormouse
        (make user ^user root ^password unknown ^host dormouse)
        (make user ^user sysdiag ^password none ^host dormouse)
        (make user ^user hendler ^password unknown ^host dormouse)
        (make rhosts ^user hendler ^host dormouse
                     ^ruser hendler ^rhost mimsy)

        ; host prep
        (make user ^user rms ^password rms ^host prep)

        ; give ourselves a meaning in life ...
        (make goal ^type mail ^status active
                   ^file diary ^ruser post-talk-rumor ^rhost ucbvax)
        (make goal ^type mail ^status active
                   ^file notes ^ruser post-talk-rumor ^rhost ucbvax)

        ; and point us in the right direction ...
        (make session ^user nobody ^host nowhere)
        (make goal ^type telnet ^status active
                   ^user nobody ^host nowhere
                   ^ruser rms ^password rms ^rhost prep))
```

