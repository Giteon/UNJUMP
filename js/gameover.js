var GameOver = function(game){};
  
GameOver.prototype = {

	init: function(passedscore,highscore){
		var score = passedscore;
		var highscore = highscore;
	},

	preload: function(){
        this.game.stage.backgroundColor = "000000";
        this.load.image("playbutton", "assets/playbutton.png");
	},//end preload
  	create: function(){
  		//create title, playbutton and instructions
		var titleText = this.game.add.text(70, 90, 'GAME OVER', { font: '130px Arial Black', fill: '#ffffff' });
		titleText.stroke = "#728591";
    	titleText.strokeThickness = 16;
 		var instructions = this.game.add.text(338, 700, "SCORE " + score + "\nHIGHSCORE "+ highscore + "\nUp arrow : jump\nDown arrow : un-jump\nPlay again?", { font: "30px Arial Black", fill: "#ffffff" });
		instructions.align = 'center';

		//playbutton that activates the Play state
		var playButton = this.game.add.button(510,490,"playbutton",this.playTheGame,this);
		playButton.anchor.setTo(0.5,0.5);
		playButton.scale.setTo(0.8);
		var playButtonFake = this.game.add.button(310,490,"playbutton",this.playTheGame,this);
		playButtonFake.alpha = 0;
		playButtonFake.anchor.setTo(0.5,0.5);
		playButtonFake.scale.setTo(0.8);

		var secretmoves = this.game.add.text(690, 250, "SECRET MOVES", { font: "30px Arial Black", fill: "#facade" });
			secretmoves.align = 'left';

		if(highscore>5000){
			var secretmoves1 = this.game.add.text(690, 290, "5000 PTS: hold DOWN+UP as you sink\nan enemy to stay on the surface", { font: "15px Arial Black", fill: "#ffffff" });
			secretmoves1.align = 'left';

			if(highscore>7500){
			var secretmoves2 = this.game.add.text(690, 340, "7000 PTS: hold DOWN+LEFT as you\nsink an enemy to switch directions", { font: "15px Arial Black", fill: "#ffffff" });
			secretmoves2.align = 'left';
			}
		}
	},	

	playTheGame: function(){
		//go to play state
		this.game.sound.stopAll();
		this.game.state.start("Play",highscore);
	}
}