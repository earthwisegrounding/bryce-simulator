// All the jokes live here. Add your own to RANDOM_EVENTS and they show up in the game.
//
// An event has text and choices. A choice is one of:
//   { label, text, fx }                         always happens
//   { label, roll: 12, win: {...}, lose: {...} } d20 roll, needs 12 or higher
//
// fx can change: tara, avoid, degree, neck, cred, reacts, pile
// Add dodged: true to a result to count it as a dump run avoided.
// Add ending: "tara" | "went" | "undefeated" to a result to end the game.

// These always happen on the listed morning.
const SCRIPTED_EVENTS = {
  1: {
    text: "Tara asks for help around the house.",
    choices: [
      { label: "Say \"yep, one sec\"", roll: 7,
        win: { text: "One sec has now lasted until dinner. Nobody can prove it wasn't one sec.", fx: { avoid: 7, tara: -5, pile: 1 } },
        lose: { text: "Tara waits one actual second, out loud. You carry a box to the garage.", fx: { avoid: -2, tara: 6, pile: -1 } } },
      { label: "Walk purposefully to the garage with a tape measure", roll: 9,
        win: { text: "Nobody questions a person holding a tape measure. You measure nothing for three hours.", fx: { avoid: 9, tara: -7, pile: 1 } },
        lose: { text: "Tara asks what you're measuring. You say \"the garage.\" Tara hands you a broom for the garage.", fx: { avoid: 1, tara: 4 } } },
      { label: "Actually help",
        text: "You get up. You pick up the first thing. It's a cable. You sit down to figure out what it goes to. It is now night.",
        fx: { avoid: 4, tara: -2 } },
    ],
  },
  3: {
    text: "Tara points at the pile. \"Dump run. Today.\"",
    choices: [
      { label: "Say the truck is making a noise", roll: 9,
        win: { text: "You describe the noise. You do the noise. It's a really convincing noise. The truck rests.", fx: { avoid: 8, tara: -8, pile: 1 }, dodged: true },
        lose: { text: "Tara starts the truck. It makes no noise. You make the noise anyway. You're going to the dump.", fx: { tara: 8, pile: -3 } } },
      { label: "Say the dump is probably closed", roll: 12,
        win: { text: "\"Probably\" does a lot of work here, and nobody checks. Nobody ever checks.", fx: { avoid: 10, tara: -10, pile: 1 }, dodged: true },
        lose: { text: "The dump's hours are on the fridge. Tara put them there in 2019.", fx: { tara: 5, pile: -3 } } },
      { label: "Go do the dump run",
        text: "You drop off three things and come back with a perfectly good amp.",
        fx: { tara: 16, pile: -2, cred: 2 } },
    ],
  },
  6: {
    text: "Tara has backed the truck up to the pile. The engine is running.",
    choices: [
      { label: "Discover an urgent homework problem", roll: 11,
        win: { text: "You close the laptop lid only when Tara walks away. You were on Wikipedia, but it was a CS article, so it counts.", fx: { avoid: 9, tara: -9, degree: 1, pile: 1 }, dodged: true },
        lose: { text: "Tara asks you to explain the problem. You say \"recursion.\" You're going to the dump.", fx: { tara: 8, pile: -3 } } },
      { label: "Start sorting the pile \"so it's more efficient\"", roll: 13,
        win: { text: "You now have four smaller piles and a laminated plan. You can't go today. The system is still curing.", fx: { avoid: 12, tara: -12, pile: 2 }, dodged: true },
        lose: { text: "Tara loads your four sorted piles in nine minutes. Thanks for the help.", fx: { tara: 8, pile: -4 } } },
      { label: "Go do the dump run",
        text: "You drop off four things. A guy at the dump gives you half a drum kit. You didn't ask.",
        fx: { tara: 16, pile: -2, cred: 3 } },
    ],
  },
  9: {
    text: "A neighbor asks Tara if the pile is an art installation. Tara looks directly at you.",
    choices: [
      { label: "Say yes, and print a little placard", roll: 13,
        win: { text: "\"Untitled (Dump Run), 2016 to Present. Mixed media.\" The neighbor nods slowly. Art is protected.", fx: { avoid: 12, cred: 8, tara: -12, pile: 1 }, dodged: true },
        lose: { text: "Tara takes the placard, adds it to the truck bed, and points at the passenger seat.", fx: { tara: 8, pile: -4 } } },
      { label: "Ask one of your 908 friends for a truck", roll: 10,
        win: { text: "You post \"anyone got a truck?\" and hope hard. Nobody answers. You did everything you could. There are witnesses.", fx: { avoid: 8, tara: -8, reacts: 12, pile: 1 }, dodged: true },
        lose: { text: "Somebody named Doug answers in four minutes. Doug is so excited. Doug is already on his way.", fx: { tara: 6, pile: -4, reacts: 3 } } },
      { label: "Go do the dump run",
        text: "You drop off a lot. You also bring back a chair that's mostly fine. Tara watches it come up the driveway.",
        fx: { tara: 14, pile: -3 } },
    ],
  },
  10: {
    text: "Day ten. Tara is holding out the truck keys. Tara has no expression at all.",
    choices: [
      { label: "Avoid the dump run one last time", roll: 15,
        win: { text: "You say the six words nobody has ever had an answer for: \"I'll just do it this weekend.\"", fx: { avoid: 10 }, dodged: true, ending: "undefeated" },
        lose: { text: "It's Saturday. Tara has checked.", fx: {}, ending: "tara" } },
      { label: "Take the keys",
        text: "You take the keys. You feel the whole pile watching you.",
        fx: {}, ending: "went" },
    ],
  },
};

// One of these happens on every other morning, without repeats.
const RANDOM_EVENTS = [
  {
    text: "A duck has walked into the yard and is standing on top of the pile.",
    choices: [
      { label: "Declare the pile a protected nesting habitat", roll: 9,
        win: { text: "You can't do a dump run now. That's a federal matter. You feel bad about it for almost a second.", fx: { avoid: 9, cred: 3, tara: -5 } },
        lose: { text: "The duck leaves. Tara watches the duck leave, then looks at you.", fx: { tara: -2 } } },
      { label: "Take a picture of the duck", text: "Great picture. Forty people react to the duck. The duck has no notes.", fx: { reacts: 40, cred: 2, tara: -2 } },
    ],
  },
  {
    text: "A headline says gamers need to get comfortable with not owning their games.",
    choices: [
      { label: "Post the meme about it", text: "If buying isn't owning, then your position is airtight. You spend all morning defending it in the comments.", fx: { reacts: 30, avoid: 3, tara: -3 } },
      { label: "Buy the game anyway", text: "It's 70 dollars, it's yours until they say otherwise, and it needs a 90-minute update. You can't possibly help until it's done.", fx: { avoid: 6, tara: -5, cred: -2 } },
    ],
  },
  {
    text: "Olympic College emails about your catalog year. It's 2016.",
    choices: [
      { label: "Appeal it", roll: 11,
        win: { text: "A nice person in the registrar's office counts a class from a catalog no one has seen in years.", fx: { degree: 1, tara: 2 } },
        lose: { text: "A nice person in the registrar's office finds a prerequisite you never had.", fx: { degree: -1 } } },
      { label: "Archive the email", text: "It's gone. The college can't get you here.", fx: { avoid: 5, degree: -1 } },
    ],
  },
  {
    text: "Someone online just wrote \"irregardless.\"",
    choices: [
      { label: "Post the paragraph", text: "It's a doggie dog world, so you curl up in the feeble position and nip it in the butt. An escape goat, ex cetera. It takes an hour to get it wrong enough.", fx: { reacts: 45, cred: 3, tara: -3 } },
      { label: "Let it go", text: "It's a mute point anyway. You feel it in your chest all day.", fx: { avoid: -1, tara: 1 } },
    ],
  },
  {
    text: "You find a post saying the Puppy Monkey Baby is in stasis, waiting until the world needs it.",
    choices: [
      { label: "Share it", text: "You check the news. The world doesn't need it yet, but you can feel it getting close.", fx: { reacts: 25, tara: -1 } },
      { label: "Stand watch", roll: 10,
        win: { text: "Somebody has to keep watch. Tara can't ask you to leave your post. You keep watch from the couch.", fx: { avoid: 8, tara: -5 } },
        lose: { text: "Tara asks what you're doing. You explain it from the top. You're given a rake.", fx: { tara: 4, pile: -1 } } },
    ],
  },
  {
    text: "Tara is on the phone. You've somehow got an acoustic guitar in your hands.",
    choices: [
      { label: "Noodle quietly", roll: 8,
        win: { text: "You've been \"tuning\" for an hour. Nobody can ask a person to carry a couch mid-tune.", fx: { avoid: 6, cred: 2, tara: -3 } },
        lose: { text: "Tara covers the phone and looks at you. You stop. You know exactly which note did it.", fx: { tara: -4 } } },
      { label: "Play the whole solo", text: "It's the best you've ever played it. Tara has walked to a different room and shut the door, so it was probably a private moment.", fx: { cred: 5, tara: -7, neck: 2 } },
    ],
  },
  {
    text: "You remember your lucky d20 is somewhere in the couch. The couch is on the pile.",
    choices: [
      { label: "Dig through the pile for it", text: "Tara sees you working on the pile and looks almost moved. You find the die. You put everything back.", fx: { tara: 8, avoid: 4 } },
      { label: "Leave it", text: "It's safe in there. If anyone moves that couch, they'd be risking a very lucky die. You'll bring this up.", fx: { avoid: 5, tara: -2 } },
    ],
  },
  {
    text: "Tara says dinner's on you tonight.",
    choices: [
      { label: "Make pasta", text: "You've made an amount of pasta that doesn't make sense. Dinner's handled through Thursday. You've never been more useful.", fx: { tara: 9, cred: 1 } },
      { label: "Say you're waiting for the water to boil", roll: 8,
        win: { text: "You put a pot on and leave the room. A watched pot, you explain later, is a real thing.", fx: { avoid: 7, tara: -6 } },
        lose: { text: "Tara turned the burner on an hour ago, and it's boiling. Tara has also put out a colander.", fx: { tara: 3 } } },
    ],
  },
  {
    text: "The couch needs moving. This seems like a good time to leave some online reviews.",
    choices: [
      { label: "Review the pub", text: "Radical rolls. Tremendous tables. Stupendous stools. It takes a while to get the alliteration right, and you owe it to them.", fx: { avoid: 5, reacts: 10, tara: -3 } },
      { label: "Review a band", text: "\"Their guitarist is probably the best ever.\" Five stars. You've checked and there's no rule against it.", fx: { cred: 6, reacts: 8, tara: -3 } },
      { label: "Review a cover band", text: "\"Your music sucks and I hope Mark Mothersbaugh sues you.\" One star. Whip it, you tell them. Whip it good and far away.", fx: { cred: 4, reacts: 15, tara: -3 } },
    ],
  },
  {
    text: "Your assignment compiled on the first try.",
    choices: [
      { label: "Find out why", roll: 12,
        win: { text: "You understand it now. You've got to stand in the yard for a minute. This is a big day.", fx: { degree: 1, cred: 2 } },
        lose: { text: "You've found out why. The file was empty. Hard.", fx: { avoid: 2, tara: -2 } } },
      { label: "Submit it and never touch it again", text: "You'll never know. It's a B-minus. Hard.", fx: { degree: 1, tara: -1 } },
    ],
  },
  {
    text: "It's raining, which you've pointed out rules out anything involving a truck.",
    choices: [
      { label: "Hold firm on the rain", roll: 7,
        win: { text: "You can't risk the couch getting wet. The couch has been outside for two years, but this is different rain.", fx: { avoid: 6, tara: -4 } },
        lose: { text: "Tara shows you the forecast. It's been the same forecast since 2016. You'll be needing a jacket.", fx: { tara: 3, pile: -1 } } },
      { label: "Check the forecast for next week", text: "Rain. You turn the phone around and show Tara. You've never been so sorry.", fx: { avoid: 4, tara: -3 } },
    ],
  },
  {
    text: "A buddy invites you over to Seattle. The ferry takes an hour, which happens to be how long chores take.",
    choices: [
      { label: "Get on the boat", text: "You spend the crossing outside in the wind, hair going everywhere, untouchable. You don't do anything in Seattle.", fx: { avoid: 6, neck: 2, tara: -6 } },
      { label: "Say you don't leave Bremerton", text: "You're straight outta here, but only in the sense of the poster. Everyone respects that.", fx: { cred: 6, tara: -1 } },
    ],
  },
  {
    text: "Your amp has appeared on the pile. Tara's reading a book and doesn't look up.",
    choices: [
      { label: "Retrieve it at 3 a.m.", roll: 10,
        win: { text: "It's a clean extraction. In the morning, neither of you brings it up, which is how you know it's war.", fx: { cred: 5, avoid: 4, tara: -3 } },
        lose: { text: "The porch light comes on. Tara's standing there holding the book. You put it down. You go inside.", fx: { tara: -2, avoid: -2 } } },
      { label: "Move the whole pile in front of it", text: "Now it's load bearing, and you can't touch the pile until there's a plan for the amp.", fx: { avoid: 8, tara: -8 } },
    ],
  },
  {
    text: "You've got a burn barrel, a mattress, and an idea.",
    choices: [
      { label: "Light it up", roll: 12,
        win: { text: "Beautiful fire. Four great pictures. The mattress doesn't burn, though. It's just angry now, and it's back on the pile.", fx: { cred: 7, reacts: 35, tara: -8 } },
        lose: { text: "Tara has been standing at the window this whole time, holding the hose.", fx: { tara: -6, cred: 2 } } },
      { label: "Have a smaller, more legal fire", text: "It's a nice fire. You sit by it for a long time. You think about the dump. You don't go.", fx: { avoid: 5, cred: 2, tara: -3 } },
    ],
  },
  {
    text: "Facebook wants you to add a workplace to your profile.",
    choices: [
      { label: "Tap \"Not now\"", text: "It's a good feeling. You'd like to tap it on other things.", fx: { avoid: 6, tara: -1 } },
      { label: "Add the pile", text: "\"Site manager at the pile.\" Six people congratulate you, and one asks if you're hiring.", fx: { reacts: 30, cred: 4, tara: -2 } },
    ],
  },
  {
    text: "Tara left a list on the counter. It has been written in pen, so it's serious.",
    choices: [
      { label: "Lose the list", roll: 10,
        win: { text: "Nobody knows where it went. You'd help if you only knew what was on it.", fx: { avoid: 9, tara: -7, pile: 1 } },
        lose: { text: "The list was laminated, and there's a second one on the fridge, and a third in your jacket.", fx: { tara: -3, avoid: -2 } } },
      { label: "Do the easiest thing on it", text: "You've crossed off \"check mail.\" You walk around for a while afterwards, a little taller.", fx: { tara: 6, avoid: 2 } },
    ],
  },
];

// Picked at the end of each day. Choose one.
const EVENING_ACTIVITIES = [
  { id: "show", label: "Go to a show at The Charleston", hint: "Headbang on the beat." },
  { id: "homework", label: "Do your computer science homework", hint: "Moves your degree along. Tara approves." },
  { id: "guitar", label: "Play guitar in the garage", hint: "Good for your cred and your avoiding." },
  { id: "meme", label: "Post a meme", hint: "Your 908 friends are waiting." },
  { id: "games", label: "Go to game night", hint: "Roll for it." },
];

const HOMEWORK_LINES = [
  "You wrote a linked list. It's linked to something, anyway. Hard.",
  "You spent three hours on a missing semicolon. You found it and it was in your heart. Hard.",
  "Big O notation is a measure of how long you've been in this program. Hard.",
  "The discussion board wants two replies to classmates. Everyone in the class was born in 2008. Hard.",
];

const GUITAR_LINES = [
  "You play the same four bars for two hours. They're really coming along.",
  "You've written a riff. You've named it \"Dump Run.\" You'll never do it, but you'll play it.",
  "You restring the guitar, which counts as maintenance, which is a kind of chore.",
];

const MEME_LINES = [
  "You post a picture of Internet Explorer with breaking news. It's from years ago, but it just finished loading.",
  "You post a chessboard with no explanation. Your uncle replies \"checkmate.\" You've got no idea what that means.",
  "You post a picture of a very large amount of noodles. People ask no follow-up questions.",
  "You post your own face, slightly stretched. It's your best-performing content.",
];

const GAME_NIGHT_WIN = [
  "You crit on the dragon and the whole table yells. You'll be telling Tara about this in detail.",
  "You roll three natural twenties in a row, and someone checks your dice. They're fine. You're just like that.",
];

const GAME_NIGHT_LOSE = [
  "Your character falls in a pit in the first ten minutes. You stay for the whole five hours anyway.",
  "You spent the whole session arguing about a rule. You were right, and it didn't help.",
];

const BANDS = ["Segfault Cathedral", "Bilge Goat", "Kitsap Cryptid", "Tide Flats Massacre", "Null Pointer Funeral"];

const OVERNIGHT_ITEMS = [
  "a printer nobody remembers buying", "one half of a futon", "a box labeled \"cables (good)\"",
  "a tire", "a TV that's heavier than it should be", "a bag of bags", "a chair with three opinions",
  "someone else's mattress", "a speaker cabinet with no speaker", "a second box labeled \"cables (good)\"",
];

const ENDINGS = {
  tara: {
    head: "Tara did the dump run",
    body: "Tara took the truck, the couch, the mattress, and an amp that was definitely not on the pile. It took forty minutes. You've been saying it would take all day for years.",
    title: "Outplayed",
  },
  went: {
    head: "You went to the dump",
    body: "You left with a full truck. You came back with a perfectly good amp, half a drum kit, and a chair that's mostly fine. The yard looks about the same. Tara looks out the window for a while.",
    title: "Net importer",
  },
  undefeated: {
    head: "The pile still stands",
    body: "Tara lowers the keys. The rain picks up. A duck lands on the couch. This weekend is a long way off, and you've never been more at peace.",
    title: "Undefeated",
  },
  degree: {
    head: "You graduated",
    body: "It says 2016 to 2026 now. You print the diploma and walk it out to the yard to show Tara. Tara says congratulations, then says the truck's running.",
    title: "Computer scientist, dump run pending",
  },
};
