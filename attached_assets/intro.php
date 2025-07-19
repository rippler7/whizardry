<?php 
	$page = 'intro';
	include('header.php');
  ?>

  <section class="intro">
    Sometime in the twelfth century<br> in the kingdom of Escanor ....
  </section>

  <section class="logo">
    <img src="assets/sprites/logo.png" style="width:500;" class="centerBoard" />
  </section>

  <div id="board">  
  <div id="content">
    <p id="title">Episode I</p>
    <p id="subtitle">LEARN YOUR WAY OUT</p>
    <br>
    <p>
        peace reigned throughout the land, people were living in harmony together. It was a perfect utopia. Magick was common to each folk, it was a staple to every aspect of human activity, be they cooking, cleaning, social revelries; basically every activity thinkable. But then a demon named Belial rose from the darkness and spread chaos all throughout the land. Many people were cowering in fear of the monster that threatened every living existence. The rise of the demon king from the darkness caused destruction to the peaceful kingdom homes destroyed, families threatened by monsters wreaking havoc to everything in its sight.</p>
        <br />
       <p>
    In the midst of raging confusion, a powerful sorcerer named Merlin has come forth to save the land. Using the ancient magic passed down through generations with a sole purpose of banishing the wicked beings that laid waste to the land and be the hero that has been foretold in the prophecy as humanity's hope against evil.
      </p>
      <br />
      <p>
        After some time, the forces of evil took notice of Merlin's exploits. Thence, the demon trapped Merlin within a walled maze, the gates of each section sealed with powerful magick. Merlin can only do so much, as he has not encountered such strange rune writings within the gates. He knew that four crystals were key to unlocking the gates, each having a different energy needed to unlock.  
      </p>
      <br />
      <p>
        Merlin knows he needs to escape the maze and confront the demon lord once and for all, but he will need your help to unlock each gate that will lead to their world's salvation. Can you help him learn to escape?
      </p>
  </div>  
  </div>
  <audio id="player" src="assets/audio/enchanted_forest_loop.ogg" style="visibility: hidden;"></audio>
  <a id="skipBtn" href="#" class="btn btn-primary centerBoard" onclick="proceed();">Skip</a>
<script type="text/javascript">
  var dtect = document.getElementById('board');
  dtect.addEventListener('webkitAnimationEnd',proceed);
  dtect.addEventListener('animationend',proceed);
  var playTimer;
  $(document).ready(function(){
    playTimer = setTimeout(function() {
      document.getElementById('player').play();
      document.getElementById('player').loop = true;
    }, 9000);

  });

  function proceed(){
    document.getElementById('player').pause();
    clearTimeout(playTimer);
    window.location.replace('game.php');
  }
</script>
<?php 
	include('footer.php');
?>