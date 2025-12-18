# Acnol Bowling Challenge

A light-weight cricket bowling mini-game where you defend a target against germ batsmen using skillful line/length selections and Acnol Clean Bowled special deliveries.

## How to run
1. From the repo root, start a simple web server (any static server works):
   ```bash
   python -m http.server 8000
   ```
2. Open the game in your browser at `http://localhost:8000`.
3. Set your target, pick a line and length, and bowl to clean up the germs.

## Game rules captured
- 6 germ batsmen with last-man-standing logic.
- 3 overs maximum (18 balls) or all wickets down ends the innings.
- Only boundaries score (4s and 6s); batsman swings on every ball and can miss.
- Acnol Clean Bowled Ball: 2 per match (1 free, 1 unlockable). 99.9% wicket chance and +50 bonus points.
- Bonus points: two wickets in a row (+40), hat-trick (+50), maiden over (+25), three dot balls (+10 + unlock).
- Match is defended if the target is not reached before wickets/balls run out.
