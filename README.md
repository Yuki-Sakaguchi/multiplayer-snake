# multiplayer-snake
socket.io でオンラインスネークゲームを作る

![sample](https://user-images.githubusercontent.com/16290220/207059061-2b1ffd47-9213-400e-bd8f-36e5c7aa0aac.png)

## demo
https://multiplayer-snake-production-d851.up.railway.app/

## 仕様
- `Create New Game` をするとコードが発行されるので、他ユーザーでそのコードを入力して `Join Game` をクリックするとゲームが開始される
- `↑`, `→`, `↓`, `←` で移動できる
- ゲーム自体は単純なスネークゲーム
- socket.io で Room 機能を使って二人での対戦を作っている

## 参考
https://www.youtube.com/watch?v=ppcBIHv_ZPs
