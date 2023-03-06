# social-app-socket.io
Node.js application utilizing Socket.IO.

- [Click Here for SocketIO Client Implementation](https://github.com/soooooyoung/react-social-app)
- [Click Here for Real Site Testing](https://snsus.click/)

## Built With

- [TypeScript](https://www.typescriptlang.org/)
- [SocketIO](https://socket.io/)
- [socket-controllers](https://github.com/typestack/socket-controllers)
- [JsonWebToken](https://www.npmjs.com/package/jsonwebtoken)
- [Winston](https://nodei.co/npm/winston/)

## Functionalities (기능) 

### Chat Room

✅ Enter/Exit Chat Room with Logs (입장/퇴장 기능 및 기록 출력)  
✅ Show List of Char Room Participants (참여자 목록 출력)  
✅ Show/Input Chat Messages (채팅 입력 기능 및 출력)  

### Message Friends

✅ Message Friends (친구 메시지 기능)  
🔲 Show Chat Logs (이전 메시지 기록 저장 및 출력)  

### Common

✅ Verify Credentials (HTTP Cookie)  
✅ Prevent Duplicate User Connection

## Implementations 

### Base Controller

Following properties are added in BassController, and inherited to all other controllers.
- List of Online Users
- Authentication Verification 
- OnConnect/OnDisconnect
- OnUpdateRoom


#### List of Online Users
```
protected users = new Map<string, string>(); 
```
List of online users are saved to monitor online users. 

#### Authentication Verification
```
  protected checkAuth = async (authToken: string) => {
    return await this.jwt.verifyToken<AuthTokenJWT>(authToken);
  };
```
**checkAuth** is used to verify authToken(JWT) with internally provided secret key.


#### OnConnect/OnDisconnect

**OnConnect** verifies user auth token and checks if it's information matches the request. If it is valid, user then is added to "users". If not, socket is disconnected.

**OnDisconnect** deletes user from "users.

#### OnUpdateRoom

**OnUpdateRoom** checks for duplicate users, and disconnects them. This function may also be extended by the inheriting controller.

### Winston Logger & Docker

Live application of this server uses winston to log system erros and infos, and uses Docker to be volume mapped in /logs directory on a VM instance.

### Events for Chat Service

Main events for chat service to receive are:
- save
- join / join_private
- leave / leave_private

#### save

Upon receiving "save", service sends ChatLog datamodel to client on sucess, as "message_success". On fail, it emits "message_fail"

#### join

Join is emitted by client to enter room in socket. If successful, server emits "join_success", along with ChatLog datamodel of user information. On fail, it emits "join_fail"

#### leave

Leave is emiited by client upon leaving room in socket. 
