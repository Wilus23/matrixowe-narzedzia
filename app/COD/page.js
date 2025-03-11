'use client';
import { useState, useEffect, useRef } from 'react';

export default function CodGame() {
  // --- AUDIO: przeniesione z AC ---
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const handlePlayMusic = () => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play();
      setMusicPlaying(true);
    }
  };
  
  const handleStopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  };

  // --- LOGI DO TERMINALA ---
  const [logs, setLogs] = useState([]);

  function logToTerminal(msg) {
    setLogs((prev) => [...prev, msg]);
    console.log(msg);

    // Automatyczne przewinięcie terminala
    setTimeout(() => {
      const terminalEl = document.getElementById('terminal');
      if (terminalEl) {
        terminalEl.scrollTop = terminalEl.scrollHeight;
      }
    }, 100);
  }

  // --- KLASY POSTACI ---
  class ZolnierzeSpecjalni {
    constructor(imie, hp, dmg) {
      this.imie = imie;
      this.hp = hp;
      this.maxHp = hp;
      this.dmg = dmg;
    }

    atakuj(postac) {
      if (this.hp <= 0) {
        logToTerminal(`${this.imie} jest martwy i nie może atakować.`);
        return;
      }
      if (postac.hp <= 0) {
        logToTerminal(`${this.imie} próbuje zaatakować zwłoki ${postac.imie}, ale on już nie żyje.`);
        return;
      }
      postac.hp = Math.max(postac.hp - this.dmg, 0);
      logToTerminal(`${this.imie} zaatakował ${postac.imie}, zadając ${this.dmg} obrażeń. ${postac.imie} ma teraz ${postac.hp} HP.`);
      animateAttack(this.imie, 'attack');
    }

    noz(przeciwnik) {
      if (this.hp <= 0) {
        logToTerminal(`${this.imie} jest martwy i nie może użyć noża.`);
        return;
      }
      if (przeciwnik.hp <= 0) {
        logToTerminal(`${this.imie} próbuje zanożować martwego ${przeciwnik.imie}, ale to nic nie daje.`);
        return;
      }
      przeciwnik.hp = 0;
      logToTerminal(`${this.imie} zaatakował nożem ${przeciwnik.imie}, zabijając go natychmiast!`);
      animateAttack(this.imie, 'assassinate');
    }

    apteczka() {
      if (this.hp <= 0) {
        logToTerminal(`${this.imie} nie żyje i nie może się uleczyć.`);
        return;
      }
      const heal = 30;
      const oldHp = this.hp;
      this.hp = Math.min(this.hp + heal, this.maxHp);
      logToTerminal(`${this.imie} użył apteczki (+${this.hp - oldHp} HP). Ma teraz ${this.hp} punktów życia.`);
      animateAttack(this.imie, 'regenerate');
    }
  }

  class Przeciwnicy extends ZolnierzeSpecjalni {
    constructor(imie, hp, dmg) {
      super(imie, hp, dmg);
    }
  }

  // --- ANIMACJE ---
  function animateAttack(characterName, animationClass) {
    const elId = characterName.toLowerCase(); 
    const el = document.getElementById(elId);
    if (!el) return;

    el.classList.remove('attack', 'assassinate', 'regenerate');
    void el.offsetWidth; 
    el.classList.add(animationClass);
    setTimeout(() => {
      el.classList.remove(animationClass);
    }, 500);
  }

  // --- STAN GRY ---
  const initialState = {
    soap: new ZolnierzeSpecjalni('Soap', 450,  60),
    ghost: new ZolnierzeSpecjalni('Ghost', 350, 45),
    price: new ZolnierzeSpecjalni('Price', 450, 50),
    roach: new Przeciwnicy('Roach', 350, 45),
    gaz: new Przeciwnicy('Gaz', 600,60),
    shepherd: new Przeciwnicy('Shepherd', 450, 50),
  };

  const [characters, setCharacters] = useState(initialState);
  const [gameFinished, setGameFinished] = useState(false);
  const [victoryBanner, setVictoryBanner] = useState(null);
  const [knifeMode, setKnifeMode] = useState(false);
  const [knifeUsed, setKnifeUsed] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(true);

  const allCharKeys = ['soap', 'ghost', 'price', 'roach', 'gaz', 'shepherd'];

  async function handleClickCharacter(victimKey) {
    if (!playerTurn) {
      logToTerminal("Poczekaj na swoją kolej, zanim wykonasz ruch.");
      return;
    }
    if (gameFinished) return; 
    if (victimKey === 'soap') {
      logToTerminal('Soap nie może zaatakować samego siebie (na razie).');
      return;
    }

    const soap = characters.soap; 
    const victim = characters[victimKey];

    if (soap.hp <= 0) {
      logToTerminal(`Soap jest martwy i nie może atakować.`);
      return;
    }

    if (knifeMode) {
      soap.noz(victim);
      setKnifeUsed(true);    // Użycie noża – nie można już więcej!
      setKnifeMode(false); 
    } else {
      soap.atakuj(victim);
    }

    setCharacters({ ...characters });
    await othersAttack();
    
  }

  async function handleApteczka() {
    if (!playerTurn) {
      logToTerminal("Poczekaj na swoją kolej, zanim wykonasz ruch.");
      return;
    }
    if (gameFinished) return;
    characters.soap.apteczka();
    setCharacters({ ...characters });
    await othersAttack();
    
  }

  async function othersAttack() {
    setPlayerTurn(false); // Wyłącz możliwość ruchu gracza
    const livingKeys = allCharKeys.filter((key) => characters[key].hp > 0);

    for (const charKey of livingKeys) {
      if (charKey === 'soap') continue; // Pomijamy gracza
      const attacker = characters[charKey];
      if (attacker.hp <= 0) continue;
      
      const possibleTargets = livingKeys.filter((k) => k !== charKey && characters[k].hp > 0);
      if (possibleTargets.length === 0) continue;
      
      const targetKey = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      const target = characters[targetKey];
      
      attacker.atakuj(target);
      setCharacters({ ...characters });
      
      // 1-sekundowe opóźnienie przed następnym ruchem
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    checkVictory(); // Now we check victory AFTER enemies finish attacking
    setPlayerTurn(true); // Gracz może ponownie wykonać ruch
  }

  function checkVictory() {
    const living = allCharKeys.filter((key) => characters[key].hp > 0);

    if (living.length === 1) {
      const winnerKey = living[0];
      if (winnerKey === 'soap') {
        setVictoryBanner(
          <div className="banner win">
            <h2>Wygrałeś!</h2>
            <img src="https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/salute-edze5TIMKs9gHEvPxqsN8OPDD1tXsz.png" className='wynik' alt="" width={150}/>
          </div>
        );
        logToTerminal(`<span style="color: gold;">Koniec gry! Wygrał ${characters[winnerKey].imie}.</span>`);
      } else {
        setVictoryBanner(
          <div className="banner lose">
            <h2>Przegrałeś!</h2>
            <img src="https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/death-CTphNZqqByAH8jX1412aAo3k3nugm1.png" className='wynik' alt="" width={150}/>
          </div>
        );
        logToTerminal(`<span style="color: red;">Koniec gry! ${characters[winnerKey].imie} wygrał. Przegrałeś!</span>`);
      }
      setGameFinished(true);
    } else if (living.length === 0) {
      setVictoryBanner(
        <div className="banner lose">
          <h2>Wszyscy zginęli!</h2>
        </div>
      );
      logToTerminal(`<span style="color: red;">Wszyscy zginęli. Brak zwycięzcy.</span>`);
      setGameFinished(true);
    }
  }

  function restartGame() {
    setCharacters({
      soap: new ZolnierzeSpecjalni('Soap', 25, 9),
      ghost: new ZolnierzeSpecjalni('Ghost', 14, 8),
      price: new ZolnierzeSpecjalni('Price', 12, 7),
      roach: new Przeciwnicy('Roach', 15, 7),
      gaz: new Przeciwnicy('Gaz', 8, 12),
      shepherd: new Przeciwnicy('Shepherd', 30, 4),
    });
    setLogs([]);
    setGameFinished(false);
    setVictoryBanner(null);
    setKnifeMode(false);
    setKnifeUsed(false);
    setPlayerTurn(true);
    logToTerminal("--- Gra została zresetowana ---");
  }

  useEffect(() => {
    logToTerminal("Rozpoczynamy Rozgrywkę Call of Duty (Last Man Standing)!");
    logToTerminal("Kliknij dowolną postać (poza Soapem), by zaatakować ją zwykłym atakiem.");
    logToTerminal("Użyj przycisku 'Noż' przed kliknięciem, aby zaatakować natychmiast nożem.");
    logToTerminal("Użyj przycisku 'Apteczka', aby uleczyć Soapa.");
    logToTerminal("Wszyscy żywi po Twoim ruchu również atakują losowo – przeżyć może tylko jeden!");
  }, []);

  return (
    <>
      {/* Audio (z AC, plus przeniesione refy) */}
      <audio id="intro-music" ref={audioRef} src="https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/soundtrack-yrTMfypXqBHbJrViD3DFCm16gXU8Y8.mp3" autoPlay loop muted hidden />

      <div className="game-container">
        <h1>Call of Duty: Last Man Standing</h1>
        <button onClick={() => musicPlaying ? handleStopMusic() : handlePlayMusic()} className="music-toggle">
         <img src={musicPlaying ? "https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/mute-dpoUoM9cbtUeDh0IT2CROQ42VmckJa.png" : "https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/muzyka-15cR5tVVDukEkhDbk0gjdq9jzJG9i6.png"} alt="Toggle Music" />
        </button>

        <div className="player-info">
          <strong>HP Soap:</strong> {characters.soap.hp} / {characters.soap.maxHp}
        </div>

        <div className="actions">
          <button 
            onClick={() => { if (!knifeUsed) setKnifeMode(!knifeMode); }}
            className={knifeMode ? 'active' : ''}
            disabled={gameFinished || knifeUsed}
          ><img src="https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/knife-EpFM09cduVY2VcENtCnNwLoudUCX1K.png" alt=""/>
            {knifeUsed ? 'Noż zużyty' : (knifeMode ? 'Noż Aktywny!' : 'Noż')}
          </button>
          <button onClick={handleApteczka} disabled={gameFinished}>
          <img src="https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/apteczka-qD2JrXAbHDjuSVUKViCBYrBULOHgwN.png" alt=""/>
            Apteczka
          </button>
        </div>

        {/* Główna sekcja z postaciami */}
        <div className="characters">
          {allCharKeys.map((key) => {
            const char = characters[key];
            const hpPercent = (char.hp / char.maxHp) * 100;
            return (
              <div 
                key={key} 
                className={`character ${char.hp > 0 ? 'alive' : 'dead'}`} 
                id={key.toLowerCase()}
                onClick={() => handleClickCharacter(key)}
              >
                <div className="char-name">{char.imie}</div>
                <div className="hp-bar">
                  <div 
                    className="hp-bar-inner" 
                    style={{ width: `${Math.max(hpPercent, 0)}%` }}
                  />
                </div>
                <div className="hp-text">{char.hp} / {char.maxHp}</div>
              </div>
            );
          })}
        </div>

        {/* Terminal logów */}
        <div id="terminal" className="terminal">
          {logs.map((line, idx) => (
            <div key={idx} className="log-line" dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>

        {victoryBanner}

        {gameFinished && (
          <div className="restart">
            <button onClick={restartGame}>Zagraj jeszcze raz</button>
          </div>
        )}

      </div>

      <style jsx>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
        }

        body {
          background-size: cover;
        }

        .game-container {
          min-height: 100vh;
          color: #eee;
          font-family: sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          text-align: center;
          background: url('https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/background-I23PG0mFQvw1Ry1PGnQ4S8vUh8QK3e.jpeg') no-repeat center center fixed;
        }

        h1 {
          margin-top: 0;
        }

        .player-info {
          margin-bottom: 10px;
          font-size: 18px;
        }

        .actions {
          margin-bottom: 20px;
        }

        .actions button {
          background: #555;
          color: #eee;
          border: none;
          padding: 10px 20px;
          margin: 0 5px;
          cursor: pointer;
          transition: background 0.3s;
          font-size: 16px;
          min-width: 120px;
        }

        .actions button:hover:not(:disabled) {
          background: #777;
        }

        .actions button:disabled {
          background: #333;
          cursor: not-allowed;
        }

        .actions button.active {
          background: #d50000;
        }

        .characters {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 1200px;
          margin-bottom: 20px;
        }

        .character {
          width: 150px;
          height: 200px;
          margin: 10px;
          border: 2px solid #555;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s;
          background-color: #222;
          background-repeat: no-repeat;
          background-size: 100% auto; 
          background-position: center center; 
        }

        .character.alive:hover {
          transform: scale(1.05);
        }
        .character.dead {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Soap */
        #soap {
          background-image: url('https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/soap-lVK4rFij6UF6FlhePacWUyo7nGiRrU.webp');
          background-size: 110% auto; 
          background-position: center center;
        }

        /* Ghost */
        #ghost {
          background-image: url('https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/ghost-N7NDyQKkda4jEZn6gkR5VNg8gspvbM.png');
          background-size: 80% auto; 
        }

        /* Price */
        #price {
          background-image: url('https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/price-2N43mhljpLppOAbeBWXdUvke0xuiAN.webp');
          background-size: 90% auto;
          background-position: center -15%;
        }

        /* Roach */
        #roach {
          background-image: url('https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/roach-08R9O1eSJ7W7VCpXGWFWKPPa3Wkxjg.png');
          background-size: 80% auto;
          background-position: center 0%;
        }

        /* Gaz */
        #gaz {
          background-image: url('https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/gaz-SR8bgpbQlcJYMxatg1YlspdDsy9qsv.webp');
          background-size: 120% auto;
          background-position: center -150%;
        }

        /* Shepherd */
        #shepherd {
          background-image: url('https://ecwt8zyzvrjyva9m.public.blob.vercel-storage.com/stas/shepherd-XvCa5XtuLQVCAbNbJ2WAQhj9mcxfhJ.png');
          background-size: 120% auto;
          background-position: center -190%;
        }

        .char-name {
          position: absolute;
          top: 5px;
          left: 0;
          width: 100%;
          text-align: center;
          font-weight: bold;
          color: #ffdc9f;
          text-shadow: 1px 1px 2px #000;
        }

        .hp-bar {
          position: absolute;
          bottom: 35px;
          left: 5px;
          width: 140px;
          height: 12px;
          background-color: #555;
          border: 1px solid #000;
          border-radius: 5px;
        }

        .hp-bar-inner {
          height: 100%;
          background-color: #0f0;
          border-radius: 5px;
          transition: width 0.3s;
        }

        .hp-text {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 100%;
          text-align: center;
          font-size: 14px;
          color: #fff;
          text-shadow: 1px 1px 2px #000;
        }

        .terminal {
          width: 80%;
          max-width: 1000px;
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid #333;
          min-height: 120px;
          max-height: 200px;
          padding: 10px;
          font-size: 14px;
          overflow-y: auto;
          margin-bottom: 20px;
          text-align: left;
        }

        .log-line {
          margin: 2px 0;
          line-height: 1.4;
        }

        .banner {
          margin-top: 10px;
          padding: 20px;
          text-align: center;
          border: 2px solid #fff;
          border-radius: 8px;
          animation: bannerAnim 2s ease-in-out infinite alternate;
          display: flex;
          justify-content: center;
        }
        .wynik{
          width: 150px;
        }
        .win h2 {
          background: linear-gradient(45deg, #00c853, #64dd17);
          color: #222;
          font-size: 120px;
          font-weight: bold;
        }
        .banner.lose {
          background: linear-gradient(45deg, #d50000, #ff1744);
          color: #222;
          font-size: 24px;
          font-weight: bold;
        }
        @keyframes bannerAnim {
          from { transform: scale(1); }
          to   { transform: scale(1.05); }
        }

        .restart {
          margin-bottom: 20px;
        }

        .restart button {
          background-color:rgb(26, 87, 5);
          color: #fff;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }

        .restart button:hover {
          background-color: rgb(39, 131, 8);
        }
        
        /* Animacje ataku, noża, regeneracji */
        .attack {
          animation: attackAnim 0.4s forwards;
        }
        .assassinate {
          animation: assassinateAnim 0.6s forwards;
        }
        .regenerate {
          animation: regenerateAnim 0.4s forwards;
        }
        
        .music-toggle {
          position: fixed;
          top: 10px;
          right: 10px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          z-index: 1000;
        }
        .music-toggle img {
          width: 30px;
          height: 30px;
        }

        @keyframes attackAnim {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(20px, -10px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes assassinateAnim {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(0, -10px) scale(1.15); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes regenerateAnim {
          0%   { filter: brightness(1); }
          50%  { filter: brightness(2); }
          100% { filter: brightness(1); }
        }
        
        .actions button img {
          width: 24px;
          height: auto;
          margin-right: 8px;
          vertical-align: middle;
        }
      `}</style>
    </>
  );
}