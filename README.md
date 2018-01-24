# discord-inhouse-league

This is a Discord bot that helps set up inhouse league (IHL) games. An IHL is a competitive environment where all players are specially invited, and ratings are tracked.

This bot was designed specifically for the game Battlerite, but is built on a strong foundation and can be easily tailored to other games.

## Installation

Before you can run this, you will need a [Discord bot application](https://discordapp.com/developers/applications/me) and a [Graphcool](https://www.graph.cool/) account. Graphcool is used as the backend and database engine. Import the schema from the file `schema.graphql`.

Then, rename `config.template.js` to `config.js`, and fill in the relevant information. The `server` key denotes the name of the Discord server that this bot will function on. The `cmdChannels` key denotes the list of channels that the bot will parse messages in. The `admin` key denotes the list of DiscordIDs (each as a String) that are treated as administrators.


Next, run:
```
npm install
npm run bot
```

## How It Works

Players join the queue using **!queue join**. Once six people (easily configurable if you need another number) joins the queue, the draft starts. The draft is the process in which the two captains (two highest rated players) draft the players for their team. Drafting is preferable to auto-assigning teams based off of ratings due to the importance of team role composition in most games.

The drafting process is done in Direct Messages with the bot. Once the drafting is completed, all players are alerted that the match is starting, along with the information about the teams.

When the match has been played and is fully completed, both captains must report the score with **!match report** to record the match. Then, the ratings of each player are updated using TrueSkill.


## Commands

Default commands:

* **!register** *< username >* - Registers the message sender into the league.
* **!leaderboard** - Prints the top players and their ratings.
* **!rating** *< username >* - Prints the rating of inputted player.
* **!queue join** - Joins the game queue.
* **!queue leave** - Leaves the game queue.
* **!match report** *< win / loss >* - Reports the result of the match.
* **!addrole** *< Melee / Ranged / Support >* - Tags the sender as role.

Admin commands:

* **!listdraft** - Views the current ongoing drafts and matches.
* **!removedraft** *< draft index >* - Removes the selected drafts.


## Screenshots


The queue:

![alt text](https://i.imgur.com/IQ0qqwy.png "Queue")

A non-captain player's POV of the match process:

![alt text](https://i.imgur.com/euZ53H6.png "Non-captain POV")

A captain's POV of the match process:

![alt text](https://i.imgur.com/36XhYaz.png "Captain POV")


## Optional Pro League

By default, all matches are counted as part of the Amateur League. To optionally enable the pro league, simply create a channel with the word `pro` in it. Don't forget to add it to your `cmdChannels` too in `config.js`. Now, any players who queue from that channel are treated as Pros. Pro League features a separate queue, matchmaking, and rating system from the Amateur League.



## Example Frontend Interface

Because all recorded matches and players are stored in the online GraphCool database, it is easy to create an online frontend interface to view leaderboards and match history.

An example can be found at [battlerite-ihl.com](http://battlerite-ihl.com), which is a fork of another project of mine, [Rivals Rankings](https://github.com/kennethwang14/rivals-rankings).
