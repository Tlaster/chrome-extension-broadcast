Broadcast for communication between chrome extension `contentscript` and `background` and web page
# Usage
Register a listener
```
Broadcast.on("some message", (data) => {
    //do something
})
```
send message
```
Broadcast.send("some message", data);
```