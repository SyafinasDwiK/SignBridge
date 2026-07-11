const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendChat");

function addMessage(text, sender){

    const message = document.createElement("div");

    message.className = "message " + sender;

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.innerHTML = text;

    message.appendChild(bubble);

    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

sendButton.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});

function sendMessage(){

    const text = chatInput.value.trim();

    if(text==="") return;

        addMessage(text,"user");

        chatInput.value="";

        showTyping();

        fetch("/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                message:text

            })

        })

        .then(response=>response.json())

        .then(data=>{

            removeTyping();

            addMessage(data.answer,"ai");

        })

        .catch(error=>{

            removeTyping();

            addMessage("Maaf, AI sedang tidak dapat diakses.","ai");

        });
}


function showTyping(){

    const message=document.createElement("div");

    message.className="message ai";

    message.id="typingIndicator";

    message.innerHTML=`

        <div class="bubble">

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;

    chatMessages.appendChild(message);

    chatMessages.scrollTop=chatMessages.scrollHeight;

}

function removeTyping(){

    const typing=document.getElementById("typingIndicator");

    if(typing){

        typing.remove();

    }

}