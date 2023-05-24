
var timer;
var time = 30;
let level;
let totalClicks = 0;
let pairsLeft;
let pairsMatched = 0;
let totalPairs;
let totalCards;
let lockBoard = false;

const getPokemon = async () => {
    let level = $('input[name="level"]:checked').val();
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=40');
    pokemonData = response.data.results;
    shuffle(pokemonData);
    getCards(level);
    ;
}

const shuffle = (pokemon) => {
    for (let i = pokemon.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pokemon[i], pokemon[j]] = [pokemon[j], pokemon[i]];
    }
}

const powerUp = () => {
    alert("Power Up!");
    $('.cards:not(.matched)').toggleClass('flip');
    setTimeout(() => {
        $('.cards:not(.matched)').toggleClass('flip');
    }, 1000);
}



const getCards = (level) => {
    $('#game_grid').removeClass('game-grid-easy game-grid-medium game-grid-hard');
    var selectedPokemon = [];
    level = parseInt(level);
    let pokemonCards = [];
    pairsLeft = level;
    totalPairs = level;
    totalCards = level * 2;
    updateBanner(totalClicks, pairsLeft, pairsMatched, totalPairs);
    if (level === 3) {
        $('#game_grid').addClass('game-grid-easy');
        selectedPokemon = pokemonData.slice(0, 3)
        pokemonCards = selectedPokemon.flatMap(pokemon => [pokemon, { ...pokemon }]);;
        shuffle(pokemonCards);
    } else if (level === 6) {
        time = 45;
        $('#game_grid').addClass('game-grid-medium');
        selectedPokemon = pokemonData.slice(0, 6);
        pokemonCards = selectedPokemon.flatMap(pokemon => [pokemon, { ...pokemon }]);;
    } else if (level === 10) {
        time = 60;
        $('#game_grid').addClass('game-grid-hard');
        selectedPokemon = pokemonData.slice(0, 10);
        pokemonCards = selectedPokemon.flatMap(pokemon => [pokemon, { ...pokemon }]);;
    } else {
        $('#game_grid').addClass('game-grid-easy');
        selectedPokemon = pokemonData.slice(0, 3)
        pokemonCards = selectedPokemon.flatMap(pokemon => [pokemon, { ...pokemon }]);;
        shuffle(pokemonCards);
    }
    console.log(pokemonCards);


    $('#game_grid').empty();
    var i = 1;
    pokemonCards.forEach(async (pokemon) => {
        const res = await axios.get(pokemon.url)
        $("#game_grid").append(`
        <div class="cards">
            <img class="front_face" id=${i} src="${res.data.sprites.other['official-artwork'].front_default}" alt="">
            <img class="back_face" src="back.webp" alt="pokeball">
        </div>
        `
        )
        i++;
    })
}

const start = () => {
    
    lockBoard = false;
    totalClicks = 0;
    pairsMatched = 0;
    $('#winAlert').hide();
    $('#timesUp').hide();
    $('#game_grid').show();
    $('#reset').show();
    $('#banner').show();
    $('#timerDiv').show();
    timer = setInterval(updateTimer, 1000);
    updateTimer();
}

const win = () => {
    $('#winAlert').show();
    clearInterval(timer);
}


const updateBanner = (totalClicks, pairsLeft, pairsMatched, totalPairs) => {
    $("#banner").html(
        `
        <p>Clicks: ${totalClicks}</p>
        <p>Pairs Left: ${pairsLeft}</p>
        <p>Pairs Matched: ${pairsMatched} / ${totalPairs}</p>
    `)
}



const reset = () => {
    $('#winAlert').hide();
    lockBoard = false;
    clearInterval(timer);
    $('#timesUp').hide();
    $('#winAlert').hide();
    $('#game_grid').hide();
    $('#banner').hide();
    $('#reset').hide();
    $('#timerDiv').hide();
    time = 30;
    totalClicks = 0;
    pairsMatched = 0;
}

const updateTimer = () => {
    if (time > 0) {
        time = time - 1;
        $('#timer').html(time);
    } else {
        clearInterval(timer);
        $('#timesUp').show();
    }

}

const changeTheme = (theme) => {
    const bodyElement = document.body;
    const themes = ['light', 'pink', 'dark'];
    themes.forEach((themeClass) => {
        bodyElement.classList.remove(themeClass);
    });
    bodyElement.classList.add(theme);
};

const setup = () => {

    $("#level-selection").html(`
    <form class="btn-group btn-group-toggle" data-toggle="buttons" id="level-form">
  <label class="btn btn-secondary">
    <input type="radio" id="easy" value=3 name="level" autocomplete="off" checked='checked'> Easy
  </label>
  <label class="btn btn-secondary">
    <input type="radio" id="medium" value=6 name="level" autocomplete="off"> Medium
  </label>
  <label class="btn btn-secondary">
    <input type="radio" id="hard" value=10 name="level" autocomplete="off"> Hard
  </label><br>
  <button id='start' type='submit'>Start</button>
</form>
`)

    $("#level-form").submit(function (event) {
        event.preventDefault();
        let level = $('input[name="level"]:checked').val();
        start();
        getPokemon(level);
        return level
    });

    $("#timerDiv").html(`
    <h2>Timer: <span id="timer"></span> seconds</h2>
  `);

    $('#theme-selector').html(`
    <form class="color-picker">
    <label for="light" class="visually-hidden">Light</label>
    <input type="radio" name="theme" id="light" checked>
    <label for="pink" class="visually-hidden">>Pink</label>
    <input type="radio" id="pink" name="theme">
    <label for="dark" class="visually-hidden">>Dark</label>
    <input type="radio" id="dark" name="theme">
    </form>
  `)

    $(".color-picker").on("change", "input[name='theme']", function () {
        const newTheme = this.id;
        changeTheme(newTheme);
    });



    let firstCard = undefined
    let secondCard = undefined
    $("#game_grid").on("click", ".cards:not(.matched)", function () {
        if (lockBoard) return;


        $(this).toggleClass("flip");

        if (!firstCard) {
            firstCard = $(this).find(".front_face")[0]
        } else {
            secondCard = $(this).find(".front_face")[0]
            lockBoard = true;
            if (firstCard.id === secondCard.id) {
                firstCard = undefined
                secondCard = undefined
                totalClicks++;
                totalClicks++;
                lockBoard = false;
                updateBanner(totalClicks, pairsLeft, pairsMatched, totalPairs);
                return;
            }
            if (firstCard.src === secondCard.src) {
                $(`#${firstCard.id}`).parent().off("click");
                $(`#${secondCard.id}`).parent().off("click");
                $(`#${firstCard.id}`).parent().addClass("matched");
                $(`#${secondCard.id}`).parent().addClass("matched");
                firstCard = undefined;
                secondCard = undefined;
                totalClicks += 2;
                pairsLeft -= 1;
                pairsMatched += 1;
                updateBanner(totalClicks, pairsLeft, pairsMatched, totalPairs);
                if (pairsLeft === 0) {
                    win();
                }
                lockBoard = false;
            } else {
                setTimeout(() => {
                    $(`#${firstCard.id}`).parent().toggleClass("flip")
                    $(`#${secondCard.id}`).parent().toggleClass("flip")
                    firstCard = undefined;
                    secondCard = undefined;
                    totalClicks += 2;
                    let random = Math.floor(Math.random() * 4);
                    console.log(random)
                    if (random === 2) {
                        powerUp();
                    }
                    lockBoard = false;

                    updateBanner(totalClicks, pairsLeft, pairsMatched, totalPairs);
                }, 1000)
            }

        }
    }
    )



    $("#buttons").html(
        `<button id="reset" onClick="reset()" style="display: none;">Reset</button>
         `
    )
}

$(document).ready(setup)