var Play = function(game){};

Play.prototype = {
    init: function(passedhighscore){
        var highscore = passedhighscore;
        var moonRadius;
        var ladRadius;
        var ladSpeed;
        var gravity;
        var jumpForce;
        var moonX;
        var moonY;
        var scale;
        var jerk;
        var jounce;
        var gotHit;
        var slowmo;
        var score;
        var midUnJump;
        var jumpSpeed;
        var playerMoonLine;
        var enemyIntersectLine;
        var timerDifficulty;
        var spawnCount;
        var combo;
        var randColor;
        var comboXPos;
        var comboYPos;
        var comboScale;
        },

    preload: function(){
        //texture atlas for enemy moon and enemy
        this.game.load.atlasJSONHash('atlasmoon','assets/ssbigcircle.png','assets/ssbigcircle.json');
        moonRadius = 500;
        scale = 1;
        jerk = 1;
        jounce = 0.99988;
        gotHit = 1;
        slowmo = 1;
        score = 0;
        ladRadius = 50;
        ladSpeed = 1.3;
        gravity = 0.8;
        jumpForce = 12;
        jumpSpeed = 0;
        midUnJump = false;
        fromTheVoid = false;
        moonX = this.game.width /2;
        moonY = this.game.height /2;
        playerMoonLine = new Phaser.Line(0,0,0,0);
        enemyIntersectLine = new Phaser.Line(0,0,0,0);
        timerDifficulty = 5500;
        spawnCount = 0;
        combo = 0;
        randColor = 0;
        comboXPos = 0;
        comboYPos = 0;
        comboScale = 0;
    },

    create: function(){
        if(typeof(highscore) == 'undefined'){highscore = 0;}
        //make moons
        moon = this.add.sprite(this.game.width / 2, this.game.height / 2, "moon");
        moon.anchor.setTo(0.5);
        blackmoon = this.add.sprite(this.game.width / 2, this.game.height / 2, "blackmoon");
        blackmoon.anchor.setTo(0.5);
        blackmoon.alpha = 0; //make black moon invisible to begin

        //make player
        lad = this.add.sprite(this.game.width / 2, (this.game.height + moonRadius + ladRadius)/2, "eyeplayer");
        lad.scale.setTo(1,1);
        lad.anchor.setTo(0.5);   

        //enemy group
        enemies = this.game.add.group();
        enemies.enableBody = true;
        spawnEnemy = this.game.time.create(false);

        //  Start a timer that makes an enemy every 8 seconds
        spawnEnemy.loop(timerDifficulty, this.makeEnemy, this);
        spawnEnemy.start();

        //score decreases when inside moon
        scoreAtrophy = this.game.time.create(false);
        scoreGrow = this.game.time.create(false);
        scoreGrow.loop(20, this.scoreBoost, this);
        scoreGrow.start();

        //player parameters
        lad.currentAngle = -90;
        lad.jumpOffset = 0;
        lad.jumps = 0;
        lad.jumpForce = 0;
        lad.enableBody = true;

        //show life bar
        blackLifeBar = this.game.add.sprite(50,90,"blacklifebar");
        blackLifeBar.scale.setTo(.1,.1);
        lifeBar = this.game.add.sprite(50,90,"lifebar");
        lifeBar.scale.setTo(.1,.1);
        
        //display text
        blackScoreText = this.game.add.text(820, 80, 'SCORE  0', { font: '35px Impact', fill: '#000000' });
        scoreText = this.game.add.text(820, 80, 'SCORE  0', { font: '35px Impact', fill: '#ffffff' });
        blackLevelText = this.game.add.text(820, 120, 'LEVEL 1', { font: '35px Impact', fill: '#000000' });
        levelText = this.game.add.text(820, 120, 'LEVEL 1', { font: '35px Impact', fill: '#ffffff' });
        comboText = this.game.add.text(450, 500, 'COMBO!', { font: '90px Impact', fill: '#ffffff' });
        comboText.alpha = 0;

        //load in audio and begin music
        cursors = this.game.input.keyboard.createCursorKeys();
        speedertime = this.game.add.audio('speedertime');
        slowertime = this.game.add.audio('slowertime');
        speedertime.volume = 0.2;
        slowertime.volume = 0.3;
        pop = this.game.add.audio('pop');
        wack1 = this.game.add.audio('wack1');
        wack2 = this.game.add.audio('wack2');
        kick = this.game.add.audio('kick');
        jump = this.game.add.audio('jump');
        jump.allowMultiple = false;
        appetizerman = this.game.add.audio('appetizerman', 1, true);
        appetizerman.loop = true;
        appetizerman.play();
        appetizerman.onLoop.add(function(){    appetizerman.play();},this);
        appetizerman.volume = 1;
        woosh = this.game.add.audio('woosh');
        woosh.volume = 0.4;
        // reverseorbitmusic.loop = true;

        //make the first enemy
        this.makeEnemy();

        randColor = Math.floor(Math.random()*13777215).toString(16);
        this.game.stage.backgroundColor=randColor;
        document.getElementsByTagName('body')[0].style["background-color"]="#"+randColor;
    },

    update: function(){
        this.moveLad();
        this.moveEnemy();
        lad.bringToTop();

        jumpSpeed = (Math.random()>.4); //higher number = slower jump speed

        if(((cursors.up.isDown && jumpSpeed)||lad.jumpOffset>0) && !midUnJump){ //if up pressed, or player hasn't landed, jump into space
            this.checkJump();
        }
        else if((cursors.down.isDown && jumpSpeed)||lad.jumpOffset<0){//if down pressed, or player hasn't un-landed, jump into moon
            this.checkAntiJump();
        }
       
        this.scaleMoon();
        this.detectCollision();
        this.slowMotion();
        this.growShrinkEnemy();//grow enemy when spawning, shrink when marked, and then kill when size is 0
        //enemy grows when spawning
        this.animateCombo();
        // comboText.scale.setTo(moonRadius/400, moonRadius/400);
    },

    spaceUp: function(){
        if(!midUnJump){
            if(lad.jumps < 1){
                    score += 20;
                    scoreText.text = 'SCORE  ' + score;
                    blackScoreText.text = 'SCORE  ' + score;
                    lad.jumps ++;
                    lad.jumpForce = jumpForce;
                    jump.play();
                }
                lad.jumpOffset += lad.jumpForce;
                lad.jumpForce -= gravity;
                if(lad.jumpOffset <= 20){ //if hit the ground
                    if(lad.jumpOffset<=0){
                    lad.jumpOffset = 0;
                    lad.jumps = 0;
                    lad.jumpForce = 0;
                    fromTheVoid = false;
                    }
                    for(var i = 0; i < enemies.length; i ++){
                        if(enemies.getChildAt(i).marked == true && cursors.down.isDown){
                           enemies.getChildAt(i).okToKill = true;
                            woosh.play();
                            //player can switch directions 
                            if(cursors.left.isDown && lad.jumpOffset <= 0){
                                ladSpeed = -ladSpeed;
                            }
                        }
                    }
                }
                //check if player scooped an enemy
                else if(lad.jumpOffset > 50 && fromTheVoid){ //if came from blackmoon and height is > enemy size
                    playerMoonLine.fromSprite(lad, moon, false); //make a line going through player and moon
                    //for each enemy, draw perpendicular line to the player line,
                    for (var i = 0; i < enemies.length; i ++){
                        var intersectDist = 0;
                        var x1 = playerMoonLine.start.x;
                        var x2 = playerMoonLine.end.x;
                        var y1 = playerMoonLine.start.y;
                        var y2 = playerMoonLine.end.y;
                        var x0 = enemies.getChildAt(i).x;
                        var y0 = enemies.getChildAt(i).y;
                        intersectDist = ((Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1))
                                        /(Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2))));

                        if(intersectDist < 8 && Math.abs(lad.x-enemies.getChildAt(i).x)<moonRadius/4 && Math.abs(lad.y-enemies.getChildAt(i).y)<moonRadius/4 && Math.abs(lad.x-enemies.getChildAt(i).x)>5 && Math.abs(lad.y-enemies.getChildAt(i).y)>5 && enemies.getChildAt(i).growScale > .05){
                        //console.log("line: " + intersectDist + "  Enemy dist: " + Math.abs(lad.x-enemies.getChildAt(i).x)+ "  Moon radius: " + moonRadius/5);
                            // if(enemies.getChildAt(i).isWall==false){//only suck in enemies
                                enemies.getChildAt(i).marked = true;    
                            // }
                        }
                        
                    }//end for
                   
                }
                if(moonRadius<500){
                moonRadius +=5;
            }
        }
    },

    spaceDown: function(){
        if(lad.jumps < 1){
                lad.jumps ++;
                lad.jumpForce = jumpForce;
                jump.play();
            }
            lad.jumpOffset -= lad.jumpForce;
            lad.jumpForce -= gravity;
            if(lad.jumpOffset > 0){
                lad.jumpOffset = 0;
                lad.jumps = 0;
                lad.jumpForce = 0;
                midUnJump = false;
                for (var i = 0; i < enemies.length; i ++){//unmark enemies that werent scooped
                    if(enemies.getChildAt(i).marked == true){
                    enemies.getChildAt(i).marked = false;}
                }
            }
            else {midUnJump = true;}

            if(moonRadius>400){
            moonRadius -=5;
        }
    },

    moveLad: function(){
        var moonScale; //to set position during blackmoon/whitemoon
        if(blackmoon.alpha != 0){
        moonScale = scale*jerk;}
        else {moonScale = (scale/jerk);}
        // console.log("scale: "+ scale + " jerk: "+ jerk + " scale/jerk: "+scale/jerk);

        //slower towards the center
        var radiusRelativeSpeed = (moonRadius-400)/300;//speeds up relative to size of moon
        if(ladSpeed > 0){ladSpeed = 2.3;}
        if(ladSpeed < 0){ladSpeed = -1.3;}
        lad.currentAngle = this.wrapAngle(lad.currentAngle + ladSpeed/(moonScale)*Math.pow(slowmo,1/6) - radiusRelativeSpeed);
        var radians = lad.currentAngle*Math.PI/180;//convert to 
        
            
        var distanceFromCenter = (moonRadius + ladRadius)*moonScale / 2 + lad.jumpOffset;

        //move x and y of player
        lad.x = (moon.x + distanceFromCenter * Math.cos(radians) );
        lad.y = (moon.y + distanceFromCenter * Math.sin(radians) );

        //rotate sprite - should flip directions if blackmoon
        var revolutions = (moonRadius / ladRadius) + 1;
        if(lad.jumpOffset!=0){lad.angle = lad.angle;}//freeze rolling @nimtion during jump
        else if(blackmoon.alpha == 0){lad.angle = (lad.currentAngle * revolutions * scale)*gotHit;}
        //reverse directions if collides with enemy
        else{lad.angle = -(lad.currentAngle * revolutions * scale)*gotHit;}
    },

    moveEnemy: function(){
        var radiusRelativeSpeed = (moonRadius-400)/450;

        for (var i = 0; i < enemies.length; i ++){
            var enemyDistanceFromCenter = (500 + ladRadius)*scale/jerk / 2 / enemies.getChildAt(i).scoopFactor;
            if(enemies.getChildAt(i).isWall==true){
                var enemyDistanceFromCenter = (450 + ladRadius)*scale/jerk / 2 / enemies.getChildAt(i).scoopFactor;
            }
        //speed = current speed +  slow motion variable * current direction - radius of moon
        enemies.getChildAt(i).currentAngle = this.wrapAngle(enemies.getChildAt(i).currentAngle + enemies.getChildAt(i).direction*slowmo - radiusRelativeSpeed);
        var radians = -enemies.getChildAt(i).currentAngle*Math.PI/180;
        enemies.getChildAt(i).x = (moon.x + (enemyDistanceFromCenter) * Math.cos(radians));
        enemies.getChildAt(i).y = (moon.y + (enemyDistanceFromCenter) * Math.sin(radians));
        }
    },

    makeEnemy: function(){ //make the next new enemy
        if(Math.random()>.35){enemies.create(2000,2000, 'atlasmoon','bigcircle'); enemies.getChildAt(enemies.length-1).isWall=false;}
        else if((spawnCount/5)>2){enemies.create(2000,2000, 'bigcircle'); enemies.getChildAt(enemies.length-1).isWall=true;}
        else{enemies.create(2000,2000, 'atlasmoon','bigcircle'); enemies.getChildAt(enemies.length-1).isWall=false;}
        //add animations if not a wall
        if(enemies.getChildAt(enemies.length-1).isWall==false){
            enemies.getChildAt(enemies.length-1).animations.add('white', ['bigcircle'], 10, true, false);
            enemies.getChildAt(enemies.length-1).animations.add('black', ['bigblackcircle'], 10, true, false);
        }
        enemies.getChildAt(enemies.length-1).enableBody = true;

        if(moon.alpha == 0){ //set colors based on background, if moon is dark
            if(enemies.getChildAt(enemies.length-1).isWall==false){//if not a wall
                enemies.getChildAt(enemies.length-1).animations.play('black');
            }else{  //wall
                enemies.getChildAt(enemies.length-1).tint = 0x000000;
            }

        } else {//moon is light
            if(enemies.getChildAt(enemies.length-1).isWall==false){//if not a wall
                enemies.getChildAt(enemies.length-1).animations.play('white');
            }else{ //wall
                enemies.getChildAt(enemies.length-1).tint = 0xffffff;
            }
        }
        //nonspecific parameters
        enemies.getChildAt(enemies.length-1).scale.setTo(0,0);
        enemies.getChildAt(enemies.length-1).anchor.setTo(0.5);

        //specific to each enemy
        var spencerjpeterson;
        if(Math.random()>.5){spencerjpeterson = Math.random()*.7+0.3;}
        else{spencerjpeterson = -(Math.random()*.7+0.3);}


        enemies.getChildAt(enemies.length-1).gotHit = 1;
        //if lad speed flips, flip direction of child that hit

        if(enemies.getChildAt(enemies.length-1).isWall==false){//if not a wall
            enemies.getChildAt(enemies.length-1).direction = spencerjpeterson;  //speed and direction
            enemies.getChildAt(enemies.length-1).currentAngle = -90*spencerjpeterson;
        }else{
            enemies.getChildAt(enemies.length-1).direction = 0.22;  //static if a wall
            enemies.getChildAt(enemies.length-1).currentAngle = 360*Math.random();
        }
        enemies.getChildAt(enemies.length-1).growScale = 0;
        enemies.getChildAt(enemies.length-1).scoopFactor = 1;
        enemies.getChildAt(enemies.length-1).marked = false;
        enemies.getChildAt(enemies.length-1).okToKill = false;

         //  Start the timer again, a bit faster
        spawnEnemy.stop();
        if(timerDifficulty>1500){
        timerDifficulty -= (Math.random()*100);
        }
        spawnCount ++;
        spawnEnemy.loop(timerDifficulty, this.makeEnemy, this);
        spawnEnemy.start();
        if(spawnCount%5 == 0){ //spawn count multiple of 5
            levelText.text = 'LEVEL ' + spawnCount/5;
            blackLevelText.text = 'LEVEL ' + spawnCount/5;
        }
    },

    growShrinkEnemy: function(){
        for (var i = 0; i < enemies.length; i ++){



            if(enemies.getChildAt(i).isWall==false && enemies.getChildAt(i).growScale < .1 && enemies.getChildAt(i).marked == false){ //enemy not done growing
            enemies.getChildAt(i).growScale += .002;
            }else if(enemies.getChildAt(i).isWall==true && enemies.getChildAt(i).growScale < .15 && enemies.getChildAt(i).marked == false){ //wall not done growing
            enemies.getChildAt(i).growScale += .005;
            }

            else if(enemies.getChildAt(i).growScale > 0 && enemies.getChildAt(i).marked == true && enemies.getChildAt(i).okToKill == true){ //not done shrinking
                if(enemies.getChildAt(i).isWall==false){
                    enemies.getChildAt(i).growScale -= .004;
                }
                else{
                    enemies.getChildAt(i).growScale -= .01;
                }
                enemies.getChildAt(i).scoopFactor += 0.04;

                //reverse enemy color
                if(enemies.getChildAt(i).isWall==false){//if not a wall
                    enemies.getChildAt(i).animations.play('white');
                }else{ //wall
                    enemies.getChildAt(i).tint = 0xffffff;
                }//end reverse color

            }
            enemies.getChildAt(i).scale.setTo(enemies.getChildAt(i).growScale,enemies.getChildAt(i).growScale); //set the size of enemy

            if(enemies.getChildAt(i).marked == true && enemies.getChildAt(i).growScale <= 0 && enemies.getChildAt(i).okToKill == true){//done shrinking -> destroy
                    if(enemies.getChildAt(i).isWall==false){
                        score+=100;
                        scoreText.text = 'SCORE  ' + score;
                        blackScoreText.text = 'SCORE  ' + score;
                    }
                    else{
                        score+=10;
                        lifeBar.width +=5;
                        blackLifeBar.width +=5;

                    }
                    //check if you got two in one
                    for(var j=0; j<enemies.length;j++){
                        if(enemies.getChildAt(j).marked == true){
                            combo++;
                            if(combo>1 && comboScale>0.9){
                                console.log("combo: "+ combo);
                                score+=50*combo;
                                comboText.alpha = 1;
                                comboText.text = 'COMBO!';
                                comboText.fill = "#" + randColor;
                                comboXPos = 350;
                                comboYPos = 450;
                                comboScale = 0;
                                this.game.time.events.add(1300, function () {comboText.alpha = 0;}, self);
                            }
                        }
                    }
                    enemies.getChildAt(i).destroy(true);
                    pop.play();
                    combo = 0;
                    //console.log("enemy killed");
            }   
            
        }
    },

    detectCollision: function(){ //collision between player and enemy
        for (var i = 0; i < enemies.length; i ++){
            var offsetDetect = (lad.jumpOffset)/20;
            var obstacleWidth = 42;
            if(enemies.getChildAt(i).isWall==true){obstacleWidth=56;}
            //if overlapping, haven't already triggered overlap, whitemoon is active, and enemy has fully spawned
            if(Math.abs(lad.x-enemies.getChildAt(i).x)<(obstacleWidth+offsetDetect) && Math.abs(lad.y-enemies.getChildAt(i).y)<(obstacleWidth+offsetDetect) && (enemies.getChildAt(i).gotHit == 1) && blackmoon.alpha == 0 && enemies.getChildAt(i).growScale > .09){//got hit
                if(enemies.getChildAt(i).isWall==false){
                    lifeBar.width -=10;
                    blackLifeBar.width -=10;
                }

                if(lifeBar.width < 1){this.sendtoGameOver();} //if life is 0, go to game over

                enemies.getChildAt(i).gotHit = -1; //so event won't trigger more than once on the same collision
                gotHit = -1;
                var tempSound = Math.random();
                if(enemies.getChildAt(i).isWall==false){//play whack only if enemy
                    if(Math.random()>0.5){wack1.play();} 
                    else{wack2.play();} 
                }

                if(enemies.getChildAt(i).direction * ladSpeed >= 0){//if product of speeds is negative: head on collision
                    ladSpeed = -ladSpeed;
                    if(enemies.getChildAt(i).isWall==false){
                        enemies.getChildAt(i).direction = -enemies.getChildAt(i).direction;
                    }
                }
                else if(Math.abs(ladSpeed) < Math.abs(enemies.getChildAt(i).direction)){ //player got hit from behind
                    if(enemies.getChildAt(i).isWall==false){
                        enemies.getChildAt(i).direction = -enemies.getChildAt(i).direction;
                        enemies.getChildAt(i).direction /=1.1;
                    }
               }
                else { //player hit enemy from behind
                    ladSpeed = -ladSpeed; //reverse player direction only
                    //slow player
                    //ladSpeed /= 1.2;
                    if(enemies.getChildAt(i).isWall==false){
                        enemies.getChildAt(i).direction *=1.1;
                    }
                }
                if(enemies.getChildAt(i).isWall==true){
                    enemies.getChildAt(i).destroy(true);
                    pop.play();
                    score+=10;
                    scoreText.text = 'SCORE  ' + score;
                    blackScoreText.text = 'SCORE  ' + score;
                    break;
                }
                


            }/*end got hit*/ else if (Math.abs(lad.x-enemies.getChildAt(i).x)>=(40+offsetDetect) && Math.abs(lad.y-enemies.getChildAt(i).y)>=(40+offsetDetect)){ //player and enemy no longer touching
                enemies.getChildAt(i).gotHit = 1;
                gotHit = 1;
            }
        }
    },

    checkJump: function(){
        if (blackmoon.alpha != 0 && moon.alpha == 0){//if black moon is in sky
            //swap color of enemy after moon changes
            for (var i = 0; i < enemies.length; i ++){
                if(enemies.getChildAt(i).isWall==false){//if not a wall
                    enemies.getChildAt(i).animations.play('white');
                }else{ //wall
                    enemies.getChildAt(i).tint = 0xffffff;
                }
            }
            //invisible black moon and make white moon visible
            blackmoon.alpha = 0;
            moon.alpha = 1;
            randColor = Math.floor(Math.random()*16777215).toString(16);
            // console.log(parseInt(randColor,16));
            while(parseInt(randColor,16)>10000000||parseInt(randColor,16)<1500000){//if randcolor too bright
                // console.log("too bright. redo: " + parseInt(randColor,16));
                randColor = Math.floor(Math.random()*16777215).toString(16);
            }
            this.game.stage.backgroundColor=randColor;
            document.getElementsByTagName('body')[0].style["background-color"]="#"+randColor;
            scoreText.alpha = 1; //switch display text
            lifeBar.alpha = 1; //switch display life bar
            levelText.alpha = 1;
            comboText.fill = "#" + randColor;
            scoreAtrophy.stop();//stop decaying score
             //  score increases every tenth of a second during black moon
            scoreGrow.loop(20, this.scoreBoost, this);
            scoreGrow.start();
            speedertime.play();
            //appetizerman.play();
            // reverseorbitmusic.stop();
            fromTheVoid = true;
        }
        this.spaceUp();
    },

    checkAntiJump: function(){
        if (moon.alpha != 0 && blackmoon.alpha == 0){//if white moon is in sky
            //swap color of enemy after moon changes
            for (var i = 0; i < enemies.length; i ++){
                if(enemies.getChildAt(i).isWall==false){//if not a wall
                    enemies.getChildAt(i).animations.play('black');
                }else{ //wall
                    enemies.getChildAt(i).tint = 0x000000;
                }
            }
            //invisible moon and make black moon visible
            blackmoon.alpha = 1;
            moon.alpha = 0;
            randColor = Math.floor(Math.random()*16777215).toString(16);
            // console.log(parseInt(randColor,16));
            while(parseInt(randColor,16)<6000000||parseInt(randColor,16)>13000000){//if randcolor too dark
                // console.log("too dark. redo: " + parseInt(randColor,16));
                randColor = Math.floor(Math.random()*16777215).toString(16);
            }
            this.game.stage.backgroundColor=randColor;
            document.getElementsByTagName('body')[0].style["background-color"]="#"+randColor;
            scoreText.alpha = 0; //switch display text
            lifeBar.alpha = 0; //switch display life bar
            levelText.alpha = 0;
            comboText.fill = "#" + randColor;
            scoreGrow.stop();
            //  score decreases every half a second during black moon
            scoreAtrophy.loop(100, this.scoreDecay, this);
            scoreAtrophy.start();
            slowertime.play();
            // reverseorbitmusic.play();
        }
        this.spaceDown();
    },

    scaleMoon: function(){ //rescale for each moon type
        if(blackmoon.alpha != 0 && scale > .6){//blackmoon
            scale*=.999;
            jerk*=jounce;
            
        } else if (moon.alpha != 0 && scale < 1.2){//whitemoon
            scale*=1.001;
            jerk *=(1/jounce);
        }
        blackmoon.scale.setTo(scale,scale);
        moon.scale.setTo(scale,scale);
    },

    slowMotion: function(){ //slow motion when player in blackmoon
        if(blackmoon.alpha != 0 && slowmo > 0.09){//if blackmoon and not done slowing down
            slowmo -= 0.02;
        }
        else if(blackmoon.alpha == 0 && slowmo < 1){//whitemoon
            slowmo += 0.04;
        }
    },
    scoreDecay: function(){
        if(score>0){
        score--;
        }
        scoreText.text = 'SCORE  ' + score;
        blackScoreText.text = 'SCORE  ' + score;
    },
    scoreBoost: function(){
        score++;
        scoreText.text = 'SCORE  ' + score;
        blackScoreText.text = 'SCORE  ' + score;
    },

    wrapAngle: function(angle){
        var newAngle = angle;
        while (newAngle <= -180) newAngle += 360;
        while (newAngle > 180) newAngle -= 360;
        return newAngle;
    },

    sendtoGameOver: function(){
        //if(highscore == undefined){console.log("highscore was undef"); highscore = 0;}
        if(score > highscore){highscore = score;}
        scoreGrow.stop();
        document.getElementsByTagName('body')[0].style["background-color"]="black";
        this.game.state.start("GameOver", score, highscore);
    },

    animateCombo: function(){
         if((comboScale)<1.01){
            comboScale+=0.013;comboXPos+=2; comboYPos+=0.6;
            comboText.position.setTo(comboXPos, comboYPos);
            comboText.scale.setTo((1-comboScale), (1-comboScale))
        }
    },

    render: function(){
        //this.game.debug.lineInfo(playerMoonLine,50,50);
        //this.game.debug.pointer( this.game.input.activePointer );
    }
}