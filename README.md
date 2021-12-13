# Romantic bot

This bot is based on "node-telegram-bot-api" library.
It can send compliments according to user's sex and preffered frequency.
It has 7 commands:

*/start* - basic greeting;
*/info* - description of the bot;
*/get_compliment* - getting a single lovely message;
*/set_timer* - choose the interval you want to be between periodic messages;
*/stop_timer* - stop set timer;
*/set_sex* - choose your sex;
*/error* - get the developer contact to report about bug;

## Documentation

#### Constants

**users** - an array with Objects of users;

**adminId** - an id which is used to give admin rights;

**complimentUrl** - an array with path to files with compliments reffering to current sex;

**timerOptions** - an Object with markup for choosing time to the next compliment;

**sexOptions** - an Object with markup for choosing sex;

#### Functions

**getCompliment(sex: string) -> string** (receives a sex value and returns a string with compliment text);

**getSticker() -> string** (returns a path to sticker);

**findUser(id: number) -> Object** (receives user's id and returns an Object with this user);

**writeUsers() -> undefined** (writes a current array with users to the file);

**setTimer(id: number, data: string) -> Object** (receives user's id and a time to the next compliment, rewrites user's Object data and returns a new array with users);

**getTimerCompliment() -> self** (a recursive function which checks whether it is a time to send a compliment to anyone once per second);