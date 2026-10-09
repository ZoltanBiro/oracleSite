// Blog posts, newest first. No individual /blog/:slug pages by design —
// every post just renders in order on the one /blog page. To add a post,
// add an object here; views/main/blog.ejs loops over this array.

module.exports = [
  {
    title: 'Senators Enter 2026–27 Looking Like a Different Team',
    date: 'Jul 2026',
    tags: ['NHL', 'Senators', 'Hockey'],
    body: [
      "After getting swept in the first round by Carolina, Ottawa's offseason has been anything but quiet. The biggest shock was trading longtime captain Brady Tkachuk to Florida — a move that was never going to sit well with a fanbase that rallied around him for years, but one that brought back the 9th and 25th overall picks in a draft class the front office clearly had plans for.",
      "They used that 9th pick to flip for William Eklund out of San Jose, which addresses a hole on the left side that's been a problem for multiple seasons now. Pairing him with Tim Stützle gives the top six a different look than it's had in years — younger, and less dependent on one dominant line to do all the offensive heavy lifting.",
      "The core underneath all of it is still there: Stützle, Jake Sanderson, Thomas Chabot. What's less settled is the back end of the roster and the goaltending mix, and cap space is tight enough that not every pending free agent — Claude Giroux included — is a guaranteed return.",
      "My honest take: trading a captain is always going to read as a step backward in July, but Ottawa's actual problem the last few years hasn't been a lack of talent, it's had too much money and term tied up in the wrong parts of the roster. If this is the start of spreading that around more sensibly instead of just running it back with the same top-heavy group, I'm fine with a summer that looks uncomfortable on paper.",
      "Cautiously optimistic, with the usual caveat: this team has a habit of making headlines in July and disappearing by December. Training camp will tell us a lot faster than any offseason grade will.",
    ],
  },
  {
    title: 'The Financials Behind the AI Bubble Talk',
    date: 'Jul 2026',
    tags: ['Finance', 'AI', 'Markets'],
    body: [
      "The headline capex numbers alone are enough to make you blink. The handful of companies building out AI infrastructure are now spending in the hundreds of billions annually, and estimates for the year keep getting revised upward rather than down. As a share of GDP, it's approaching territory usually reserved for once-in-a-generation infrastructure booms — railroads, electrification, that kind of company.",
      "What actually worries me isn't the size of the number, it's the shape of the financing behind it. A meaningful chunk of the biggest recent funding rounds trace back to the same handful of cloud providers who also happen to be the customer on the other end of the deal — money that gets raised, then contractually committed right back into buying compute from the company that helped raise it. That doesn't make the revenue fake, exactly, but it does mean a slice of the growth everyone's citing is recycled capital chasing itself in a circle, not new external demand showing up organically.",
      "There's also a quieter problem sitting off to the side: a lot of the real financial commitment here — long-term data center leases signed but not yet active — doesn't show up in the capex figures analysts actually scrutinize. It sits off balance sheet until it doesn't, which is a pattern that tends to look fine right up until it isn't.",
      "None of this means a crash is imminent, and I'm not in the \"this is just dot-com again\" camp — these are real companies with real, growing usage, not shell corporations with a domain name and a pitch deck. But the math only works if hardware lasts as long as everyone's modeling and utilization stays high, and both of those are assumptions, not guarantees. If either one slips, a lot of very concentrated financial exposure gets uncomfortable very quickly.",
      "There's something almost funny about writing this from a $0 Oracle Cloud free-tier instance with 1GB of RAM, watching numbers get thrown around that dwarf entire national economies for compute I will personally never come within a thousand miles of touching.",
    ],
  },
];

