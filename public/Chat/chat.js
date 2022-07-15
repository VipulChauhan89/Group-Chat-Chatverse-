(function(){
    const app = document.querySelector(".app");
    const socket = io();
    let uname;
    let room;
    let room_pass;
    app.querySelector(".join-screen #join-user").addEventListener("click",function(){
        let username = app.querySelector(".join-screen #username").value;
        room = app.querySelector(".join-screen #room").value;
        document.getElementById("group").innerText=room;
        room_pass=app.querySelector(".join-screen #room-pass").value;
        if(username.length==0 || room.length==0 ||room_pass.length==0)
        {
            return;
        }
        socket.emit("join",room,room_pass);
        socket.emit("newuser",username,room,room_pass);
        uname=username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });
    
    app.querySelector(".chat-screen #send-message").addEventListener("click",function(){
        let message = app.querySelector(".chat-screen #message-input").value;
        let file = app.querySelector(".chat-screen #file").value;
        console.log(file);
        file=file.substring(12);
        if(message.length==0 && file=="")
        {
            return;
        }
        if(message.length!=0)
        {
            renderMessage("my",{
                username:uname,
                text:message
            });
            
            socket.emit("chat",{
                username:uname,
                text:message
            },room,room_pass);
        }
        else
        {
            renderMessage("my",{
                username:uname,
                text:`<img src="../Sample/${file}" height="200" width="200">`
            });
            
            socket.emit("chat",{
                username:uname,
                text:`<img src="../Sample/${file}" height="200" width="200">`
            },room,room_pass);
            document.getElementById("file").value="";
        }
        app.querySelector(".chat-screen #message-input").value="";
    });
    app.querySelector(".chat-screen #exit-chat").addEventListener("click",function(){
        socket.emit("exituser",uname,room,room_pass);
        window.location.href = "/";
    });

    socket.on("update",function(update){
        renderMessage("update",update);
    });

    socket.on("chat",function(message){
        renderMessage("other",message);
    });

    function renderMessage(type,message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        if(type=="my")
        {
            let msg=document.createElement("div");
            msg.setAttribute("class","message my-message");
            msg.innerHTML=`
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
                </div>
            `;
            messageContainer.appendChild(msg);
        }
        else if(type=="other")
        {
            let msg=document.createElement("div");
            msg.setAttribute("class","message other-message");
            msg.innerHTML=`
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
                </div>
            `;
            messageContainer.appendChild(msg);
        }
        else if(type=="update")
        {
            let msg=document.createElement("div");
            msg.setAttribute("class","update");
            msg.innerText=message;
            messageContainer.appendChild(msg);
        }

        //scrolling the chat
        messageContainer.scrollTop = messageContainer.scrollHeight-messageContainer.clientHeight;
    }
})();
function Back()
{
    const app=document.querySelector(".app");
    app.querySelector(".join-screen").classList.add("active");
    app.querySelector(".chat-screen").classList.remove("active");
    app.querySelector(".join-screen #room").value="";
    app.querySelector(".join-screen #room-pass").value="";
    app.querySelector(".chat-screen .messages").innerHTML="";
}