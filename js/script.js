const fromText = document.querySelector(".from-text"),
toText = document.querySelector(".to-text"),
exchageIcon = document.querySelector(".exchange"),
selectTag = document.querySelectorAll("select"),
icons = document.querySelectorAll(".row i");
translateBtn = document.querySelector("button"),
document.getElementById("from").addEventListener("click", () => {
    speech("from");
});

document.getElementById("to").addEventListener("click", () => {
    speech("to");
});

selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        // For the first tag (id == 0), add only English
        if (id === 0 && country_code.startsWith("en")) {
            let selected = country_code === "en-GB" ? "selected" : "";
            let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
            tag.insertAdjacentHTML("beforeend", option);
        } 
        // For the second tag (id == 1), add all languages
        else if (id === 1) {
            let selected = country_code === "hi-IN" ? "selected" : "";
            let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
            tag.insertAdjacentHTML("beforeend", option);
        }
    }
});


exchageIcon.addEventListener("click", () => {
    let tempText = fromText.value,
    tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

fromText.addEventListener("keyup", () => {
    if(!fromText.value) {
        toText.value = "";
    }
});

translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;
    if(!text) return;
    toText.setAttribute("placeholder", "Translating...");
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    fetch(apiUrl).then(res => res.json()).then(data => {
        toText.value = data.responseData.translatedText;
        data.matches.forEach(data => {
            if(data.id === 0) {
                toText.value = data.translation;
            }
        });
        toText.setAttribute("placeholder", "Translation");
    });
});

function speech(target) {
    if (!window.speechSynthesis) {
        alert("Speech synthesis is not supported in this browser.");
        return;
    }

    let textToSpeak;
    let langCode;  // Fallback to 'en-US' if no language is selected

    // Determine which text to speak and set language accordingly
    if (target === "from") {
        textToSpeak = fromText.value;
        langCode = 'fr-FR';
    } else {
        textToSpeak = toText.value;
        langCode = selectTag[1].value || 'en-US';
    }

    const voices = speechSynthesis.getVoices();
    console.log(voices)

    // Check if there is text to speak
    if (!textToSpeak) {
        alert("No text to read aloud.");
        return;
    }

    // Create a new utterance with the selected language and text
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;

    // Log language and text for debugging
    console.log("Speaking:", textToSpeak);
    console.log("Language:", langCode);

    // Start speaking
    speechSynthesis.speak(utterance);
}

if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US'; // Set the default language
    recognition.interimResults = false; // Set to true if you want to see interim results
    recognition.continuous = false; // Stop automatically after speaking

    // Toggle recording when the mic button is clicked
    let isRecording = false;

    micButton.addEventListener("click", () => {
        if (!isRecording) {
            recognition.start();
            isRecording = true;
            micButton.classList.add("recording"); // Add a visual cue for recording
        } else {
            recognition.stop();
            isRecording = false;
            micButton.classList.remove("recording");
        }
    });

    // When speech is recognized, display it in the textarea
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        fromText.value = transcript;
    };

    // Handle errors
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("An error occurred with speech recognition. Please try again.");
    };

    // Reset recording state when recognition ends
    recognition.onend = () => {
        isRecording = false;
        micButton.classList.remove("recording");
    };
} else {
    alert("Speech recognition is not supported in this browser.");
}