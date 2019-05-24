var canvas = document.getElementById("myCanvas");
var menu = document.getElementById("MainMenu");
var corona = document.getElementById("corona");
var username = document.getElementById("name");
var personnage;
var framePerso = 1;
var wall;
var vitesseWall = -5;
var myWalls = [];
var trump;
var trumps = [];
var myScore;
var background;
var music;
var hit;
var beer;
var lieu;
var imageDrop;

function controleUsername() {
	if (username.value.trim() != "" && username.value != "username") {
		game.start()
	} else {
		alert("Please enter a username");
	}
}

corona.addEventListener('dragstart', function(e){
	e.dataTransfer.setData('text/plain', "corona");
})

canvas.addEventListener('dragover', function(e){
	e.preventDefault();
});

canvas.addEventListener('drop', function(e){

	music.pause();

	beer.play();

	beer.onended = function() {
		drink.play();
		drink.onended = function() {
			music.play();
		};
	};

	e.preventDefault();

	imageDrop = e.dataTransfer.getData('text/plain');

	if(imageDrop == "corona" && vitesseWall + 2 <= -5)
		vitesseWall += 2;
	else
		vitesseWall = -5;

	corona.style.display = "none";
});

//variable qui contient les infos du canvas et qui actualise l'interval
var game = {

	//Fonction start
	start : function () {

		menu.style.display = 'none';
		canvas.style.display = 'block';
		music.play();
		this.context = canvas.getContext("2d");
		this.frameNo = 0;
		window.addEventListener("keydown", controller.keyListener);
		window.addEventListener("keyup", controller.keyListener);
		updateGame();
	},

	replay : function () {
		document.location.reload();
	}
};

//fonction qui va créer le score
function Score(width, height, color) {

	this.width = width;
	this.height = height;
	this.x = 20;
	this.y = 30;
	this.color = color;
	var value = 0;

	this.update = function () {
		this.value = game.frameNo;
		myScore.text = "Score : " + this.value;
		if(!music.paused)
			game.frameNo += 1;
	};

	//la fonction draw permet de repeindre a chaque appel
	this.draw = function () {
		ctx = game.context;
		ctx.fillStyle = color;
		ctx.fillText(this.text, this.x, this.y);
	};

}

//fonction qui va créer trump
function Trump(x, y, src, width, height) {

	this.image = new Image();
	this.image.src = src;

	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	this.draw = function () {
		ctx = game.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	};

}

//constructeur de mur
function Wall(x, y, src, width, height) {

	this.image = new Image();
	this.image.src = src;

	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	this.remove = function (pos) {
		if (this.x < 0)
			myWalls.splice(pos, 1);
	}

	this.update = function () {
		this.x += vitesseWall;
	}

	this.draw = function () {
		ctx = game.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	};
}

//constructeur du fond d'écran
function Background(src, width, height) {

	this.image = new Image();
	this.image.src = src;

	this.width = width;
	this.height = height;
	this.x = 0;
	this.y = 0;

	this.draw = function () {
		ctx = game.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	};
}

// Commande pour la touche de saut
controller = {

	up: false,
	keyListener:function(event) {

		var key_state = (event.type === "keydown")?true:false;

		if(event.keyCode == 38) {
			controller.up = key_state;
		}
	}
};

//constructeur du mexicain
function Mexicain(src, width, height) {

	this.image = new Image();
	this.image.src = src;
	this.width = width;
	this.height = height;
	this.x = 0;
	this.x_velocity
	this.y = 10;
	this.y_velocity = 0;
	this.jumping = true;

	this.draw = function () {
		ctx = game.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	};

	//méthode qui se charge de controler s'il saute
	this.jump = function () {

		if (controller.up && this.jumping == false) {
			this.y_velocity -= 20;
			this.jumping = true;
		}
		this.x_velocity = this.x;
		this.y_velocity += 0.9;// gravity
		this.y += this.y_velocity;
		this.y_velocity *= 0.9;// friction

		// Vérifie que le mexicain ne sorte pas du canvas
		if (this.y > 320 - 70 - 10) {

			this.jumping = false;
			this.y = 320 - 70 - 10;
			this.y_velocity = 0;
		}
	};

	//méthode qui va regarder si il se crash avec un autre objet
	this.crash = function (otherobj) {

		var myleft = this.x + 18;
		var myright = this.x + (this.width) - 20;
		var mytop = this.y;
		var mybottom = this.y + (this.height);
		var otherleft = otherobj.x;
		var otherright = otherobj.x + (otherobj.width);
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + (otherobj.height) - 20;
		var crash = true;

		if ((mybottom < othertop) ||
			(mytop > otherbottom) ||
			(myright < otherleft) ||
			(myleft > otherright)) {
			crash = false;
		}

		return crash;
	};

}

function endGame () {

	hit.play();
	music.pause();
	beer.pause();
	drink.pause();

	var today = new Date();
	var user = {name : username.value, date : today.getDate() + "." + (today.getMonth()+1) + "." + today.getFullYear(), pays : lieu, score : myScore.value}

	var classement = JSON.parse(localStorage.getItem('classement'));

	if (typeof classement == 'undefined' || classement == null) {
		var users = new Array();
		users.push(user);
	}
	else {
		var users = classement;
		var placey = false;

		for (var i = 0; i < users.length; i++) {

			if(user.score >= users[i].score){
				placey = true;
				users.splice(i,0, user);
				break;
			}
		}

		if(placey == false){
			users.push(user);
		}
	}

	if(users.length > 10)
		users.length = 10;

	localStorage.setItem("classement", JSON.stringify(users));

	showScore();
}

function showScore () {

	var users = JSON.parse(localStorage.getItem('classement'));
	var html = "<tr><th>Rang</th><th>Date</th><th>Nom</th><th>Lieu</th><th>Score</th></tr>"

	for (var i = 0; i < users.length; i++) {
		html+="<tr>";
		html+="<td>"+(i + 1) +"</td>";
		html+="<td>"+users[i].date+"</td>";
		html+="<td>"+users[i].name+"</td>";
		html+="<td>"+users[i].pays+"</td>";
		html+="<td>"+users[i].score+"</td>";
		html+="</tr>";
	}

	canvas.style.display = 'none';
	document.getElementById("score").innerHTML = html;
	document.getElementById("endMenu").style.display = "table-cell";

	menu.style.display = 'table';
	document.getElementById("startMenu").style.display = 'none';
}

//méthode qui actualise le jeu
function updateGame() {
	var b, x, y, crash;

	if (myScore.value%1500 == 0 && myScore.value != 0) {
		corona.style.display = "inline-block";
	}

	if(!music.paused) {
		// Animation du personnage
		if(frameInterval(5)){

			if(framePerso > 8)
				framePerso = 1;

			personnage.image.src = ("mexicain/Mex" + framePerso + ".png");
			framePerso++;
		}
	}

	background.draw();
	personnage.jump();
	personnage.draw();

	myScore.update();
	myScore.draw();

	for (i = 0; i < myWalls.length; i += 1) {
		if (personnage.crash(myWalls[i])) {
			endGame();
			crash = true;
		}
	}

	for (i=0;i<trumps.length;i+=1) {
		if (personnage.crash(trumps[i])) {
			endGame();
			crash = true;
		}
	}

	if (!crash) {

		if (!music.paused) {
			if(frameInterval(250))
				vitesseWall += -0.5;
		}

		//on fait bouger le mur
		for (i = 0; i < myWalls.length; i += 1) {

			if(!music.paused)
				myWalls[i].update();
			myWalls[i].draw();
			// On retire les murs qui sont hors canvas
			myWalls[i].remove(i);
		}

		if (!music.paused) {
			//a chaque interval de 50 images, on crée un mur
			if (frameInterval(100)) {
				x = 450;
				b = Math.floor(Math.random() * 40 + 30);
				y = 310 - b;
				//Ici on ajoute des murs
				myWalls.push(new Wall(x, y, "ressources/images/mur2.jpg", 20, b));
			}


			//créer un tableau de trump ?
			if (game.frameNo === 10 || frameInterval(225)) {

				let minHeight = 180;
				let maxHeight = 320;

				var value = Math.floor(Math.random()*(maxHeight - minHeight+1)+minHeight);

				trumps.push( new Trump(400,320-value,"ressources/images/trump.PNG",40,40));
			}
		}

		for(i=0;i<trumps.length;i+=1) {
			if(!music.paused) {
				trumps[i].x += -5;
				trumps[i].y += Math.floor(Math.random()*2);
			}

			trumps[i].draw();
		}

		requestAnimationFrame(updateGame);
	}
}

//Fonction qui récupère les coordonnées
function getCountryName() {
	if (navigator.geolocation)
		navigator.geolocation.getCurrentPosition(showPosition);
}

// Fonction qui récupère la latitude et longitude
function showPosition(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;

	console.log(latitude);
	console.log(longitude);


	var url = "http://open.mapquestapi.com/geocoding/v1/reverse?key=Uc8Ft167RbbAw40Ae7u6jACXO776ZBmg&location=" + latitude+ "," + longitude + "&includeRoadMetadata=true&includeNearestIntersection=true";

	var xmlHttp = new XMLHttpRequest();

	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
		{
			reponse = JSON.parse(xmlHttp.responseText);
			lieu = reponse["results"]["0"]["locations"]["0"]["adminArea5"];
		}
	}

	xmlHttp.open("GET", url, true); // true for asynchronous
	xmlHttp.send(null);
}

// fonction de calcul d'interal de frame
function frameInterval(n)
{
	if((game.frameNo/n)%1 == 0)
	{
		return true;
	}
	return false;
}

//fonction de création des objets
function constructGame()
{
	//localStorage.clear();
	getCountryName();
	music = new Audio('ressources/sons/music.mp3');
	hit = new Audio('ressources/sons/dead.mp3');
	beer = new Audio('ressources/sons/beer.mp3');
	drink = new Audio('ressources/sons/drink.mp3');
	personnage = new Mexicain("mexicain/Mex1.png",70,70);
	background = new Background("ressources/images/back3.jpg", canvas.width, canvas.height);
	myScore = new Score("15px","Consolas","white");
}

constructGame();


