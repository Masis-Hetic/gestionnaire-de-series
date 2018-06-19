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

  $('form').on('submit', (e) => {
    e.preventDefault();
    
    let nomDeSerie = $('input[type="search"]').val();
    settings.data = {"query": nomDeSerie};

    $.ajax(settings).done(function (response) {
      response = response.results;
      creerElementsAuClick(response);
    });
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
      $('ul.slider').append($(li));
    }
    carousel();
    recupererId();
  }

  // fonction pour récupérer l'id du film
  // quand je clique sur l'image du film
  function recupererId() {
    let clickSurImage = $('div.resultat-api ul li img');
    clickSurImage.on('click', (e) => {
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
    console.log('ma réponse détail est : ', response);
    
    let div = document.createElement('div');

    $(div).html(`
      <p>
        <img src="${imgBaseUrl}${response.poster_path}">
      </p>
      <p>${response.original_name}</p>
      <span>Synopsys : </span>
      <p>${response.overview}</p>
      <div class="wrapper">
        <p>Nombre de saisons : ${response.number_of_seasons}</p>
        <p>Nombre d'épisodes : <span class="nb-episodes">${response.number_of_episodes}</span> <span>+</span><span>-</span></p>
      </div>
    `);

    $('div.affiche-details').append($(div));

    $('button.add-to-collection').on('click', () => {
      $('div.affiche-details').addClass('close');
    });
  }
  
  // fonction pour créer le carousel avec slick-slide
  // que j'appelle dans la fonction creerElementsAuClick();
  function carousel() {
    $('.multiple-items').slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 3
    });
  }

});