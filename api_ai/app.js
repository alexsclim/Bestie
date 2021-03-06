let apiClient;
let recognition;

function changeLanguage() {
  if (apiClient.apiLang == 'en-GB') {
    apiClient.apiLang = 'zh-CN';
    recognition.lang = 'zh-CN';
    document.getElementById("language").innerHTML = "English";
    document.getElementById("textbox").placeholder = "问我一个问题!";
  } else {
    apiClient.apiLang = 'en-GB';
    recognition.lang = 'en-GB';
    document.getElementById("language").innerHTML = "中文";
    document.getElementById("textbox").placeholder = "Ask me a question!"
  }
}

function gotoListeningState() {
  const micListening = document.querySelector(".mic .listening");
  const micReady = document.querySelector(".mic .ready");

  micListening.style.display = "block";
  micReady.style.display = "none";
}

function gotoReadyState() {
  const micListening = document.querySelector(".mic .listening");
  const micReady = document.querySelector(".mic .ready");

  micListening.style.display = "none";
  micReady.style.display = "block";
}

function addBotItem(text, isDefaultIntent, isCustomerRep, isReturnPolicy, isPassword) {
  if (isDefaultIntent) {
    const appContent = document.querySelector(".app-content");
    appContent.innerHTML += '<div class="item-container item-container-bot"><div class="item"><p>'
      + "Sorry, I don't have an answer to your question, would you like to speak with a customer service agent? "
      + "<a href='facetime-audio:alexsclim@gmail.com'>Call a customer service agent here</a>"
      + '</p></div></div>';
    appContent.scrollTop = appContent.scrollHeight;
  } else if (isCustomerRep) {
    const appContent = document.querySelector(".app-content");
    appContent.innerHTML += '<div class="item-container item-container-bot"><div class="item"><p>'
      + "You can reach a customer service representative at the link provided: "
      + "<a href='facetime-audio:alexsclim@gmail.com'>Call a customer service agent here</a>"
      + '</p></div></div>';
    appContent.scrollTop = appContent.scrollHeight;
  } else if (isReturnPolicy) {
    const appContent = document.querySelector(".app-content");
    appContent.innerHTML += '<div class="item-container item-container-bot"><div class="item"><p>'
      + "The return period and product condition varies for each product category: "
      + "<a href='https://www.bestbuy.ca/en-CA/help/returns-and-exchanges-policy/hc1075.aspx' target='_blank'>please visit this link for more information</a>"
      + '</p></div></div>';
    appContent.scrollTop = appContent.scrollHeight;
  } else if (isPassword) {
    const appContent = document.querySelector(".app-content");
    appContent.innerHTML += '<div class="item-container item-container-bot"><div class="item"><p>'
      + "<a href='https://www.bestbuy.ca/profile/resetpassword.aspx?' target='_blank'>Click this link to reset your password</a>"
      + '</p></div></div>';
    appContent.scrollTop = appContent.scrollHeight;
  } else {
    const appContent = document.querySelector(".app-content");
    appContent.innerHTML += '<div class="item-container item-container-bot"><div class="item"><p>' + text + '</p></div></div>';
    appContent.scrollTop = appContent.scrollHeight;
  }
}

function addUserItem(text) {
  const appContent = document.querySelector(".app-content");
  appContent.innerHTML += '<div class="item-container item-container-user"><div class="item"><p>' + text + '</p></div></div>';
  appContent.scrollTop = appContent.scrollHeight;
}

function displayCurrentTime() {
  const timeContent = document.querySelector(".time-indicator-content");
  const d = new Date();
  const s = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  timeContent.innerHTML = s;
}

function addError(text) {
  addBotItem(text, false, false, false, false);
  const footer = document.querySelector(".app-footer");
  footer.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function(event) {

  displayCurrentTime();

  let voices = [];
  window.speechSynthesis.onvoiceschanged = function() {
    voices = window.speechSynthesis.getVoices();
  };

  apiClient = new ApiAi.ApiAiClient({accessToken: '0a7ff9ab6ee1454e9e720dc8f58e0604'});
  apiClient.apiLang = "en-GB";

  if (apiClient.apiLang = "en-GB") {
    addBotItem("Hi there! My name is Bestie, a virtual assistant tailored towards answering common questions about your Best Buy experience!", false, false, false ,false);
  } else {
    addBotItem("问我一个问题!", false, false, false, false);
  }

  recognition = new webkitSpeechRecognition();
  var recognizedText = null;
  recognition.continuous = false;
  recognition.lang = 'en-GB';
  recognition.onstart = function() {
    recognizedText = null;
  };
  recognition.onresult = function(ev) {
    recognizedText = ev["results"][0][0]["transcript"];
    addUserItem(recognizedText);
    ga('send', 'event', 'Message', 'add', 'user');

    let promise = apiClient.textRequest(recognizedText);

    promise
        .then(handleResponse)
        .catch(handleError);

    function handleResponse(serverResponse) {
      var isDefaultIntent = false;
      var isCustomerRep = false;
      var isReturnPolicy = false;
      var isPassword = false;

      const speech = serverResponse["result"]["fulfillment"]["speech"];
      msg = new SpeechSynthesisUtterance(speech);

      if (apiClient.apiLang == 'zh-CN') {
        msg.voice = voices[voices.length - 1];
        msg.lang = "zh-CN";
      } else {
        msg.voice = voices[voices.length - 17];
        msg.lang = "en-GB";
      }

      isDefaultIntent = serverResponse["result"]["metadata"]["intentName"] == "Default Fallback Intent - fallback";
      isCustomerRep = serverResponse["result"]["metadata"]["intentName"] == "CustomerRep";
      isReturnPolicy = serverResponse["result"]["metadata"]["intentName"] == "ReturnPolicy";
      isPassword = serverResponse["result"]["metadata"]["intentName"] == "ForgotPassword";

      addBotItem(speech, isDefaultIntent, isCustomerRep, isReturnPolicy, isPassword);
      ga('send', 'event', 'Message', 'add', 'bot');
      msg.addEventListener("end", function(ev) {
      });
      msg.addEventListener("error", function(ev) {
        startListening();
      });

      window.speechSynthesis.speak(msg);
    }
    function handleError(serverError) {
      console.log("Error from api.ai server: ", serverError);
    }
  };

  recognition.onerror = function(ev) {
    console.log("Speech recognition error", ev);
  };
  recognition.onend = function() {
    gotoReadyState();
  };

  function startListening() {
    gotoListeningState();
    recognition.start();
  }

  const startButton = document.querySelector("#start");
  startButton.addEventListener("click", function(ev) {
    ga('send', 'event', 'Button', 'click');
    startListening();
    ev.preventDefault();
  });

  var text = document.getElementById("textbox");
  text.addEventListener("keydown", (event) => {

    if (event.keyCode == 13) {
      var inputValue = text.value;
      event.preventDefault();
      let promise = apiClient.textRequest(inputValue);
      addUserItem(inputValue);
      promise
        .then((serverResponse) => {
          var isDefaultIntent = false;
          var isCustomerRep = false;
          var isReturnPolicy = false;
          var isPassword = false;

          const speech = serverResponse["result"]["fulfillment"]["speech"];
          msg = new SpeechSynthesisUtterance(speech);

          if (apiClient.apiLang == 'zh-CN') {
            msg.voice = voices[voices.length - 1];
            msg.lang = "zh-CN";
          } else {
            msg.voice = voices[voices.length - 17];
            msg.lang = "en-GB";
          }

          console.log(serverResponse);

          isDefaultIntent = serverResponse["result"]["metadata"]["intentName"] == "Default Fallback Intent - fallback";
          isCustomerRep = serverResponse["result"]["metadata"]["intentName"] == "CustomerRep";
          isReturnPolicy = serverResponse["result"]["metadata"]["intentName"] == "ReturnPolicy";
          isPassword = serverResponse["result"]["metadata"]["intentName"] == "ForgotPassword";

          addBotItem(speech, isDefaultIntent, isCustomerRep, isReturnPolicy, isPassword);
          ga('send', 'event', 'Message', 'add', 'bot');
          msg.addEventListener("end", function(ev) {
          });
          msg.addEventListener("error", function(ev) {
            startListening();
          });

          window.speechSynthesis.speak(msg);
          recognition.end();
        }).catch(this.handleError);
        text.value = "";
    }
  });

  document.addEventListener("keydown", function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key == "Escape" || evt.key == "Esc");
    } else {
        isEscape = (evt.keyCode == 27);
    }
    if (isEscape) {
        recognition.abort();
    }
  });


});
