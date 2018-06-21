$(document).ready(() => {
  
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://api.themoviedb.org/3/search/tv?&api_key=d46bcd29949ed56a2b10ca817a9a5bdf`,
    "method": "GET",
    "headers": {}
  }
  var settingsForDetails = {
    "async": true,
    "crossDomain": true,
    "method": "GET",
    "headers": {}
  }

  const imgBaseUrl = `http://image.tmdb.org/t/p/w300/`
  const mesSeries = JSON.parse(localStorage.getItem('mes-series')) || [];

  $('form').on('submit', (e) => {
    e.preventDefault();
    
    let nomDeSerie = $('input[type="search"]').val();
    settings.data = {"query": nomDeSerie};

    $.ajax(settings).done(function (response) {
      response = response.results;
      creerElementsAuClick(response);
    });
    $('input[type="search"]').val('');
  });

  // fonction pour créer mes éléments
  function  creerElementsAuClick(response) {
    let displayResultats = $('div.resultat-api');
    // je vide mon HTML pour le cas ou je relance une recherche
    // comme cela, les résultats de la recherche ne se rajoutent pas, dans le HTML,
    // mais ils viennent remplacer les résultats précédent.
    displayResultats.html('');
    // puis, je re-crée mon HTML que je vais afficher dans mon navigateur
    let ul = document.createElement('ul');
    $(ul).attr('class', 'multiple-items slider');
    displayResultats.append($(ul));

    for (let i = 0; i < response.length; i += 1) {
      let li = document.createElement('li');
      let img = document.createElement('img');

      // je crée object resultat qui va me permettre de tester
      // si l'api Themoviedb à le poster de la série
      resultat = {
        poster: `${imgBaseUrl}${response[i].poster_path}`
      }
      // si l'api n'a pas le poster, alors je remplace l'image
      // par celle de mon choix
      if (resultat.poster === `${imgBaseUrl}null`) {
        resultat.poster = 'img/notfound.png';
      }
      // ici, j'ajoute l'attribut 'src' à mon image
      // l'attribut est stocké dans l'object resultat
      $(img).attr('src', resultat.poster);
      // ici j'ajoute un attribut 'data-id' à mon image que je vais pouvoir
      // récupérer au clique et qui me permettra de faire une autre requete pour avoir les détails
      $(img).attr('data-id', response[i].id);

      $(li).append($(img));
      $('div.resultat-api ul.slider').append($(li));
    }
    recupererId();
    carousel();
  }

  // fonction pour récupérer l'id du film
  // quand je clique sur l'image du film
  function recupererId() {
    let clickSurImage = $('div.resultat-api ul li img');
    clickSurImage.on('click', (e) => {
      $('div.affiche-details').html('');
      let monId = e.target;
      monId = $(monId).attr('data-id');

      $('div.affiche-details').removeClass('close');
      afficheDetails(monId)
    });
  }

  // cette fonction va récupérer les détails d'une série (nombre saisons, nombre épisodes, notes etc....)
  // elle est appelé dans la fonction recupererId()
  function afficheDetails(monId) {
    let baseUrlDetails = 'https://api.themoviedb.org/3/tv/';
    let apiKey = 'api_key=d46bcd29949ed56a2b10ca817a9a5bdf';

    settingsForDetails.url = `${baseUrlDetails}${monId}?${apiKey}`;
    
    $.ajax(settingsForDetails).done(function (response) {
      creerElementsPourDetails(response);
    });
  }

  function creerElementsPourDetails(response) {
    
    let div = document.createElement('div');

    $(div).html(`
      <div class="close">
        <svg viewBox="0 0 24 24">
          <path fill="#fff" 
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" 
          />
        </svg>
      </div>
      <p>
        <img src="${imgBaseUrl}${response.poster_path}">
      </p>
      <p>${response.original_name}</p>
      <span>Synopsys : </span>
      <p>${response.overview}</p>
      <div class="wrapper">
        <p>Nombre de saisons : ${response.number_of_seasons}</p>
        <p>Nombre d'épisodes : 
          <span class="nb-episodes">${response.number_of_episodes}</span>
        </p>
        <button class="add-to-collection">Add to collection</button>
      </div>
    `);

    $('div.affiche-details').append($(div));

    addToCollection(response);
  }

  function addToCollection(response) {
    $('button.add-to-collection').on('click', () => {

      if (mesSeries.length === 0) {
        mesSeries.push({
          nom: response.name,
          episodes: response.number_of_episodes,
          seasons: response.number_of_seasons,
          id: response.id,
          poster: response.poster_path,
          overview: response.overview,
          nbepisodesvu: '0'
        });
        localStorage.setItem('mes-series', JSON.stringify(mesSeries));
      } else {
        let tabStorage = JSON.parse(localStorage.getItem('mes-series'));

        var test = [];
        for (let i = 0; i < tabStorage.length; i += 1) {
          test.push(tabStorage[i].id);
        }

        let testIfId = test.indexOf(response.id) === -1;

        if (testIfId){
          mesSeries.push({
            nom: response.name,
            episodes: response.number_of_episodes,
            seasons: response.number_of_seasons,
            id: response.id,
            poster: response.poster_path,
            overview: response.overview,
            nbepisodesvu: '0'
          });

          localStorage.setItem('mes-series', JSON.stringify(mesSeries));
        }
      }

      $('div.resultat-api').html('');
      closeDetails();
      getValuesFromStorage();
    });
  }

  // button pour fermer le détail
  function closeDetails() {
    $('.affiche-details').addClass('close');
  }
  $(document).on('click', 'div.close', () => {closeDetails();});

  // fonction pour afficher les séries depuis le localStorage
  // je l'utilise lorsque je charge la page pour la première fois,
  // et je l'utilise lorsque je met à jour le storage
  function getValuesFromStorage() {
    let displayResultats = $('div.mes-series');
    displayResultats.html('');
    let ul = document.createElement('ul');
    $(ul).attr('class', 'multiple-items slider test');
    displayResultats.append($(ul));

    if (mesSeries.length > 0) {
      for (let i = 0; i < mesSeries.length; i += 1) {
        let li = document.createElement('li');
        let img = document.createElement('img');
        
        $(img).attr('src', `${imgBaseUrl}${mesSeries[i].poster}`);
        $(img).attr('data-id', `${mesSeries[i].id}`);

        $(li).append($(img));

        $('div.mes-series .slider').append($(li));
      }  
    }
    carouselCollection();
  }
  
  // fonction qui va m'afficher le détail d'une série enregistrée dans ma collection
  function detailsFromCollection() {
    $(document).on('click', 'div.mes-series ul li img', (e) => {
      $('div.collection-details').addClass('open');

      let id = e.target;
      id = $(id).attr('data-id');
      id = parseInt(id);
      let tab = [];

      for (let i = 0; i < mesSeries.length; i += 1) {
        tab.push(parseInt(mesSeries[i].id));
      }
  
      let idFromStorage = tab.indexOf(id);

      detailCollectionFromStorage(idFromStorage);
      closeDetailCollection();
      progressBar(id);
    });
  }
  detailsFromCollection();

  function detailCollectionFromStorage(idFromStorage) {
    $('div.collection-details').html(`
      <div class="close">
      <svg viewBox="0 0 24 24">
        <path fill="#fff" 
            d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" 
        />
      </svg>
    </div>
    <div class="wrapper-left">
      <div>
        <svg data-id="${mesSeries[idFromStorage].id}" class="delete" style="width:24px;height:24px" viewBox="0 0 24 24">
          <path data-id="${mesSeries[idFromStorage].id}" fill="#fff" d="M20.37,8.91L19.37,10.64L7.24,3.64L8.24,1.91L11.28,3.66L12.64,3.29L16.97,5.79L17.34,7.16L20.37,8.91M6,19V7H11.07L18,11V19A2,2 0 0,1 16,21H8A2,2 0 0,1 6,19Z" />
        </svg>
        <img src="${imgBaseUrl}${mesSeries[idFromStorage].poster}" >
      </div>
    </div>
    <div class="wrapper wrapper-right">
      <p>${mesSeries[idFromStorage].nom}</p>
      <div class="synopsys">
        <p>Synopsys : </p>
        <p>${mesSeries[idFromStorage].overview}</p>
      </div>
      <div class="episodes">
        <p>
          <span>Épisodes vus : <span class="nombre-vu">${mesSeries[idFromStorage].nbepisodesvu}</span> sur : 
            <span class="total">${mesSeries[idFromStorage].episodes}</span>
          </span>
          <span class="plus">
              <svg viewBox="0 0 24 24" data-id="${mesSeries[idFromStorage].id}">
                <path fill="#fff" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" data-id="${mesSeries[idFromStorage].id}"/>
              </svg>
            </span>
            <span class="minus">
              <svg viewBox="0 0 24 24" data-id="${mesSeries[idFromStorage].id}">
                <path fill="#fff" d="M19,13H5V11H19V13Z" data-id="${mesSeries[idFromStorage].id}"/>
              </svg>
          </span>
          <div class="progress-bar">
            <div></div>
          </div>
        </p>
      </div>
    </div>
    `);
  }

  function episodeMoins() {
    $(document).on('click', 'span.minus svg', (e) => {
      let id = e.target;
      id = $(id).attr('data-id');
      id = parseInt(id);
      let tab = [];

      for (let i = 0; i < mesSeries.length; i += 1) {
        tab.push(parseInt(mesSeries[i].id));
      }

      let indexFromStorage = tab.indexOf(id);
      let episodes = parseInt($('span.nombre-vu').html());

      if (episodes === 0) {
        episodes = 0;
      } else {
        episodes = episodes - 1;
        mesSeries[indexFromStorage].nbepisodesvu = episodes;
        localStorage.setItem('mes-series', JSON.stringify(mesSeries));
      }
      
      $('span.nombre-vu').html(episodes);
      progressBar(id);
    });
  }
  episodeMoins();

  function episodePlus() {
    $(document).on('click', 'span.plus svg', (e) => {
      let id = e.target;
      id = $(id).attr('data-id');
      id = parseInt(id);
      let tab = [];
      
      for (let i = 0; i < mesSeries.length; i += 1) {
        tab.push(parseInt(mesSeries[i].id));
      }
      
      let indexFromStorage = tab.indexOf(id);  
      let episodeTotal = parseInt(mesSeries[indexFromStorage].episodes);
      let episodes = parseInt($('span.nombre-vu').html());
      
      if (episodes === episodeTotal) {
        episodes = episodeTotal;
      } else {
        episodes = episodes + 1;
        mesSeries[indexFromStorage].nbepisodesvu = episodes;
        localStorage.setItem('mes-series', JSON.stringify(mesSeries));
      }
      
      $('span.nombre-vu').html(episodes);
      progressBar(id);
    });
  }
  episodePlus();

  function progressBar(id) {
    let tab = [];
    for (let i = 0; i < mesSeries.length; i += 1) {
      tab.push(parseInt(mesSeries[i].id));
    }

    let indexFromStorage = tab.indexOf(id);
    
    let progressBar = $('div.progress-bar div');
    let episodeTotal = mesSeries[indexFromStorage].episodes;
    let episodes = mesSeries[indexFromStorage].nbepisodesvu;
    let progressPourcent = (episodes / episodeTotal) * 100;

    $(progressBar).css('width', progressPourcent + '%');
    
  }

  function deleteSerie() {
    $(document).on('click', '.delete', (e) => {
      let id = e.target;
      id = $(id).attr('data-id');
      id = parseInt(id);
      let tab = [];

      for (let i = 0; i < mesSeries.length; i += 1) {
        tab.push(parseInt(mesSeries[i].id));
      }
      
      let indexFromStorage = tab.indexOf(id); 
      
      mesSeries.splice(indexFromStorage, 1);
      localStorage.setItem('mes-series', JSON.stringify(mesSeries));
      getValuesFromStorage();
      $('div.collection-details').removeClass('open');
    });
  }
  deleteSerie();

  function closeDetailCollection() {
    $('div.close').on('click', () => {
      $('div.collection-details').removeClass('open');
    });
  }

  // fonction pour créer le carousel avec slick-slide
  // que j'appelle dans la fonction creerElementsAuClick();
  function carousel() {
    $('.resultat-api .multiple-items').slick({
      infinite: true,
      slidesToShow: 5,
      slidesToScroll: 5
    });
  }

  // ici c'est le carousel de ma collection
  function carouselCollection() {
    $('.mes-series .slider').slick({
      infinite: true,
      slidesToShow: 5,
      slidesToScroll: 5
    });
  }

  window.onload = getValuesFromStorage();
});