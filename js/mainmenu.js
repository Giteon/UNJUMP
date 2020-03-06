var MainMenu = function(game){
	console.log("%cGAME STARTED GOOD", "color:white; background:green");
};
  
MainMenu.prototype = {

	init: function(){},

	preload: function(){
		//load assets
		this.game.load.audio('ding', 'assets/ding.mp3');
		this.game.load.audio('no', 'assets/no.mp3');
		this.game.load.audio('great', 'assets/great.mp3');
		this.load.image("playbutton", "assets/playbutton.png");
        this.game.stage.backgroundColor = "000000";

        this.load.image("moon", "assets/bigcircle.png");
        this.load.image("blackmoon", "assets/bigblackcircle.png");
        this.load.image("eyeplayer", "assets/eyeplayer.png");
        this.game.load.audio('speedertime', 'assets/speedertime.mp3');
        this.game.load.audio('slowertime', 'assets/slowertime.mp3');
        this.game.load.audio('pop', 'assets/pop.mp3');
        this.game.load.audio('appetizerman', 'assets/AppetizerMan.wav');
        this.game.load.audio('jump', 'assets/jump.mp3');
        this.game.load.audio('woosh', 'assets/woosh.mp3');
        this.game.load.audio('wack1', 'assets/wack1.mp3');
        this.game.load.audio('wack2', 'assets/wack2.mp3');
         this.game.load.audio('kick', 'assets/kick.mp3');
        this.game.load.image('lifebar','assets/lifebar.png');
        this.game.load.image('blacklifebar','assets/blacklifebar.png');
        this.game.load.image('whiterect','assets/whiterect.png');
        this.game.load.image('blackrect','assets/blackrect.png');
        this.game.load.image('bigcircle','assets/bigcircle.png');

	},//end preload
  	create: function(){

  		//playbutton that activates the Play state
		var playButton = this.game.add.button(510,450,"playbutton",this.playTheGame,this);
		playButton.anchor.setTo(0.5,0.5);
		playButton.scale.setTo(0.8);
		var playButtonFake = this.game.add.button(310,450,"playbutton",this.playTheGame,this);
		playButtonFake.alpha = 0;
		playButtonFake.anchor.setTo(0.5,0.5);
		playButtonFake.scale.setTo(1);

  		//create title, playbutton and instructions
		var titleText = this.game.add.text(172, 90, 'UN-JUMP', { font: '130px Arial Black', fill: '#ffffff' });
		titleText.stroke = "#333333";
    	titleText.strokeThickness = 16;
 		var instructions = this.game.add.text(108, 610, "Up arrow : jump\nDown arrow : un-jump\nJump: 20 points\nKill: 100 points\nAvoid other orbs to stay un-dead\nSink orbs moon to destroy:\nunjump, jump (over target), unjump before landing", { font: "30px Arial Black", fill: "#ffffff" });
		instructions.align = 'center';

		

	},	
	playTheGame: function(){
		//go to play state, pass score var
		this.game.state.start("Play");
	}
}