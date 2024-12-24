// page.js (Next.js 15)
"use client";
import React, { useEffect } from "react";
import Head from "next/head";

export default function HomePage() {
  useEffect(() => {
    /***************************************************
     * 1) KONWERTER WALUT (pierwsza sekcja) – bez zmian
     ***************************************************/
    function grosze(zlotowki) {
      return zlotowki * 100;
    }
    function zlotowki(grosze) {
      return grosze / 100;
    }

    const form = document.getElementById("converterForm");
    const summary = document.getElementById("summary");
    const resultDiv = document.querySelector(".result");

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("amount").value);
        const direction = document.querySelector(
          'input[name="direction"]:checked'
        )?.value;

        if (isNaN(amount)) {
          summary.textContent = "Podana wartość nie jest liczbą.";
        } else {
          if (direction === "zl2gr") {
            const wynik = grosze(amount);
            summary.textContent = amount + " zł to " + wynik + " gr.";
          } else {
            const wynik = zlotowki(amount);
            summary.textContent = amount + " gr to " + wynik.toFixed(2) + " zł.";
          }
        }

        // animacja wyniku
        resultDiv.classList.remove("show");
        void resultDiv.offsetWidth;
        resultDiv.classList.add("show");
      });
    }

    /**************************************************************
     * 2) DESZCZ ZNAKÓW + KROPKA KURSORA – TYLKO W DRUGIEJ SEKCJI
     **************************************************************/
    const matrixSection = document.querySelector(".matrix-section");
    const matrixCanvas = document.getElementById("matrixCanvas");
    const cursorDot = document.getElementById("cursorDot");

    if (matrixCanvas && cursorDot && matrixSection) {
      const ctx = matrixCanvas.getContext("2d");
      const matrixChars =
        "π∇⊗θ[⌊∞⊥⌉∩⊻⊆µσ→{}≠≈⌈⊤↔∫∈ψ∉∂]⊕α∆⌋∨χ0123456789λ∑→≠÷β±ρ∞→∏⇔∞δεζ⌊∞γ→τυ∨×÷{}[()]";
      const matrixArray = matrixChars.split("");

      let fontSize = 22;
      let columns = 0;
      let drops = [];

      function resizeCanvas() {
        matrixCanvas.width = matrixSection.offsetWidth;
        matrixCanvas.height = matrixSection.offsetHeight;
        columns = Math.floor(matrixCanvas.width / fontSize);

        drops = [];
        for (let i = 0; i < columns; i++) {
          drops[i] = Math.random() * -100;
        }
      }

      window.addEventListener("load", resizeCanvas);
      window.addEventListener("resize", resizeCanvas);

      function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
          const text =
            matrixArray[Math.floor(Math.random() * matrixArray.length)];
          const xPos = i * fontSize;
          const yPos = drops[i] * fontSize;

          ctx.fillText(text, xPos, yPos);
          drops[i]++;

          if (yPos > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
        }
      }
      setInterval(drawMatrix, 40);

      // Kropka kursora w matrix-section
      let mouseX = 0,
        mouseY = 0;
      let dotX = 0,
        dotY = 0;

      matrixSection.addEventListener("mousemove", (e) => {
        const rect = matrixSection.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      });

      function animateDot() {
        dotX += (mouseX - dotX) * 0.15;
        dotY += (mouseY - dotY) * 0.15;
        cursorDot.style.left = dotX + "px";
        cursorDot.style.top = dotY + "px";
        requestAnimationFrame(animateDot);
      }
      animateDot();

      // Powiększenie kropki na hover
      const matrixInteractive = document.querySelectorAll(
        ".matrix-section button, .matrix-section input, .matrix-section select, .matrix-section label"
      );
      matrixInteractive.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursorDot.style.transform = "translate(-50%, -50%) scale(1.5)";
        });
        el.addEventListener("mouseleave", () => {
          cursorDot.style.transform = "translate(-50%, -50%) scale(1)";
        });
      });
    }

    /*******************************************************************
     * 3A) KONWERTER MASY
     ******************************************************************/
    const massForm = document.getElementById("massConverterForm");
    const massResult = document.getElementById("massResult");

    if (massForm) {
      massForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const massValue = parseFloat(document.getElementById("massValue").value);
        const fromUnit = document.getElementById("fromUnit").value;
        const toUnit = document.getElementById("toUnit").value;

        if (isNaN(massValue)) {
          massResult.textContent = "Podana wartość nie jest liczbą.";
          return;
        }

        let komunikat = "";
        const conversionRates = {
          gramy: { gramy: 1, dekagramy: 0.1, kilogramy: 0.001, tony: 0.000001 },
          dekagramy: {
            gramy: 10,
            dekagramy: 1,
            kilogramy: 0.01,
            tony: 0.00001,
          },
          kilogramy: {
            gramy: 1000,
            dekagramy: 100,
            kilogramy: 1,
            tony: 0.001,
          },
          tony: {
            gramy: 1000000,
            dekagramy: 100000,
            kilogramy: 1000,
            tony: 1,
          },
        };

        if (
          conversionRates[fromUnit] &&
          conversionRates[fromUnit][toUnit] !== undefined
        ) {
          const wynik = massValue * conversionRates[fromUnit][toUnit];
          komunikat = `${massValue} ${fromUnit} to ${wynik} ${toUnit}.`;
        } else {
          komunikat = "Nieobsługiwana konwersja.";
        }

        massResult.textContent = komunikat;
      });
    }

    /*******************************************************************
     * 3B) KONWERTER DŁUGOŚCI – mm, cm, dm, m, km
     ******************************************************************/
    const lengthForm = document.getElementById("lengthConverterForm");
    const lengthResult = document.getElementById("lengthResult");

    if (lengthForm) {
      lengthForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const lengthValue = parseFloat(
          document.getElementById("lengthValue").value
        );
        const lengthFrom = document.getElementById("lengthFrom").value;
        const lengthTo = document.getElementById("lengthTo").value;

        if (isNaN(lengthValue)) {
          lengthResult.textContent = "Podana wartość nie jest liczbą.";
          return;
        }

        // 1) najpierw do milimetrów
        let wMm = lengthValue;
        const lengthFactors = {
          mm: 1,
          cm: 10,
          dm: 100,
          m: 1000,
          km: 1000000,
        };

        if (lengthFrom in lengthFactors) {
          wMm = lengthValue * lengthFactors[lengthFrom];
        } else {
          lengthResult.textContent = "Nieobsługiwana jednostka źródłowa.";
          return;
        }

        // 2) z milimetrów do docelowej jednostki
        let final = wMm;
        if (lengthTo in lengthFactors) {
          final = wMm / lengthFactors[lengthTo];
        } else {
          lengthResult.textContent = "Nieobsługiwana jednostka docelowa.";
          return;
        }

        lengthResult.textContent = `${lengthValue} ${lengthFrom} to ${final} ${lengthTo}.`;
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Najszybszy konwerter pieniędzy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Style globalne wrzucamy w style jsx global */}
      <style jsx global>{`
        /***********************************************************
         * 1) SEKCJA – KONWERTER WALUT (więcej symboli w tle)
         ***********************************************************/
        body {
          margin: 0;
          padding: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #348ac7, #7474bf);
          color: #fff;
          overflow: auto;
        }
        .currency-section {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .symbol {
          position: absolute;
          font-size: 2.5rem;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.25);
          opacity: 0.8;
        }
        @keyframes floatLR {
          0% {
            transform: translateX(-100vw) rotate(0deg);
          }
          50% {
            transform: translateX(50vw) rotate(360deg);
          }
          100% {
            transform: translateX(100vw) rotate(720deg);
          }
        }
        @keyframes floatRL {
          0% {
            transform: translateX(100vw) rotate(0deg);
          }
          50% {
            transform: translateX(-50vw) rotate(360deg);
          }
          100% {
            transform: translateX(-100vw) rotate(720deg);
          }
        }
        @keyframes floatTB {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) rotate(360deg);
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
          }
        }
        @keyframes floatBT {
          0% {
            transform: translateY(100vh) rotate(0deg);
          }
          50% {
            transform: translateY(-50vh) rotate(360deg);
          }
          100% {
            transform: translateY(-100vh) rotate(720deg);
          }
        }
        .lr {
          animation: floatLR 10s linear infinite;
        }
        .rl {
          animation: floatRL 12s linear infinite;
        }
        .tb {
          animation: floatTB 14s linear infinite;
        }
        .bt {
          animation: floatBT 16s linear infinite;
        }
        .converter-container {
          width: 80%;
          max-width: 450px;
          margin: 0 auto;
          background: rgba(0, 0, 0, 0.5);
          padding: 2rem 2rem;
          border-radius: 20px;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.3);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 2;
        }
        .converter-container:hover {
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        }
        .converter-container h1 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
          color: #fff;
        }
        table td {
          padding: 0.5rem 0.2rem;
          vertical-align: middle;
          font-size: 1.2rem;
          color: #fff;
        }
        table label {
          font-size: 1.2rem;
          color: #fff;
          cursor: pointer;
        }
        input[type="number"] {
          width: 100%;
          padding: 0.7rem;
          border: 2px solid #fff;
          border-radius: 8px;
          font-size: 1.2rem;
          background: transparent;
          color: #fff;
          outline: none;
        }
        input[type="number"]::placeholder {
          color: #ddd;
        }
        td.konwersja label {
          display: inline-block;
          margin-right: 1rem;
        }
        input[type="radio"] {
          display: none;
        }
        input[type="radio"] + span {
          padding: 0.3rem 0.7rem;
          border-radius: 5px;
          border: 2px solid #fff;
          color: #fff;
          font-size: 1.1rem;
          display: inline-block;
          vertical-align: middle;
          cursor: pointer;
          transition: background 0.3s ease, color 0.3s ease;
        }
        input[type="radio"] + span:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        input[type="radio"]:checked + span {
          background: #fff;
          color: #000;
        }
        button {
          width: 100%;
          padding: 0.8rem;
          background: linear-gradient(135deg, #00aaff, #004f7c);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.3rem;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s ease, transform 0.3s ease,
            box-shadow 0.3s ease;
          margin-bottom: 1rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        button:hover {
          background: linear-gradient(135deg, #00ccff, #006699);
          transform: scale(1.03);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        .result h2 {
          font-size: 1.7rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        .result p {
          font-size: 1.4rem;
          color: #fff;
          margin: 0;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .result.show p {
          opacity: 1;
          transform: translateY(0);
          animation: pulseResult 0.8s ease forwards;
        }
        @keyframes pulseResult {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        /*************************************************************
         * 2) SEKCJA – MATRIXOWE KONWERTERY (masy i długości)
         *************************************************************/
        .matrix-section {
          position: relative;
          width: 100%;
          padding-top: 100px;
          padding-bottom: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background: transparent;
          overflow: hidden;
          cursor: none;
        }
        #matrixCanvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          display: block;
        }
        #cursorDot {
          position: absolute;
          top: 0;
          left: 0;
          width: 12px;
          height: 12px;
          background-color: #0f0;
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: transform 0.2s ease;
          z-index: 9999;
        }
        .units-container {
          width: 80%;
          max-width: 450px;
          margin: 40px auto;
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid #0f0;
          border-radius: 15px;
          padding: 30px 25px;
          color: #0f0;
          box-shadow: 0 0 10px #0f0;
          transform-style: preserve-3d;
          transition: transform 0.2s ease-out;
        }
        .units-container:hover {
          box-shadow: 0 0 15px #0f0;
        }
        .units-container h2 {
          text-align: center;
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #0f0;
        }
        .units-container table {
          width: 100%;
          color: #0f0;
          margin-bottom: 1.5rem;
        }
        .units-container input[type="number"],
        .units-container select {
          background: #111;
          color: #0f0;
          border: 1px solid #0f0;
          border-radius: 8px;
          width: 100%;
          padding: 10px;
          font-size: 1rem;
          outline: none;
          margin: 0.5rem 0;
        }
        .units-container button {
          background: #000;
          color: #0f0;
          border: 1px solid #0f0;
          border-radius: 8px;
          padding: 12px;
          font-size: 1.1rem;
          cursor: pointer;
          width: 100%;
          transition: background 0.3s, transform 0.2s, color 0.3s;
          box-shadow: 0 0 10px #0f0;
        }
        .units-container button:hover {
          background: #0f0;
          color: #000;
          transform: translateY(-2px);
        }
        .matrix-result {
          margin-top: 1rem;
          text-align: center;
          font-weight: bold;
          font-size: 1.3rem;
          min-height: 30px;
          color: #0f0;
        }
        /*************************************************************
         *      MEDIA QUERIES: MOBILE-FRIENDLY (max-width:600px)
         *************************************************************/
        @media (max-width: 600px) {
          .converter-container,
          .units-container {
            width: 80%;
            padding: 1rem;
          }
          .converter-container h1 {
            font-size: 1.6rem;
          }
          table td {
            font-size: 1rem;
          }
          input[type="number"] {
            font-size: 1rem;
            padding: 0.5rem;
          }
          button {
            font-size: 1.1rem;
            padding: 0.6rem;
          }
          .units-container h2 {
            font-size: 1.4rem;
          }
          .units-container input[type="number"],
          .units-container select {
            font-size: 0.9rem;
            padding: 8px;
          }
          .units-container button {
            font-size: 1rem;
            padding: 10px;
          }
          .matrix-result {
            font-size: 1.1rem;
          }
        }
      `}</style>

      {/* ************ SEKCJA 1: KONWERTER WALUT ************ */}
      <section className="currency-section">
        {/* Symbole walut */}
        <div className="symbol lr" style={{ top: "5%", left: "2%" }}>
          $
        </div>
        <div className="symbol rl" style={{ top: "20%", right: "5%", animationDuration: "10s" }}>
          €
        </div>
        <div className="symbol tb" style={{ left: "30%", animationDuration: "12s" }}>
          zł
        </div>
        <div className="symbol bt" style={{ right: "25%", animationDuration: "14s" }}>
          gr
        </div>

        <div className="symbol lr" style={{ top: "45%", left: 0, animationDuration: "9s" }}>
          €
        </div>
        <div className="symbol rl" style={{ top: "55%", right: 0, animationDuration: "11s" }}>
          zł
        </div>
        <div className="symbol tb" style={{ left: "45%", animationDuration: "8s" }}>
          gr
        </div>
        <div className="symbol bt" style={{ right: "35%", animationDuration: "10s" }}>
          $
        </div>

        <div className="symbol lr" style={{ top: "75%", left: 0, animationDuration: "13s" }}>
          zł
        </div>
        <div className="symbol rl" style={{ top: "60%", right: 0, animationDuration: "10s" }}>
          €
        </div>
        <div className="symbol tb" style={{ left: "10%", animationDuration: "9s" }}>
          $
        </div>
        <div className="symbol bt" style={{ right: "15%", animationDuration: "10s" }}>
          gr
        </div>

        <div className="symbol lr" style={{ top: "30%", left: 0, animationDuration: "7s" }}>
          zł
        </div>
        <div className="symbol rl" style={{ top: "70%", right: 0, animationDuration: "8s" }}>
          $
        </div>
        <div className="symbol tb" style={{ left: "70%", animationDuration: "9s" }}>
          €
        </div>
        <div className="symbol bt" style={{ right: "80%", animationDuration: "12s" }}>
          gr
        </div>

        <div className="converter-container">
          <h1>Najszybszy konwerter pieniędzy</h1>
          <form id="converterForm">
            <table>
              <tbody>
                <tr>
                  <td style={{ textAlign: "right" }}>
                    <label htmlFor="amount">Wartość:</label>
                  </td>
                  <td>
                    <input type="number" id="amount" placeholder="Wpisz kwotę" required />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right" }}>Konwersja:</td>
                  <td className="konwersja">
                    <label>
                      <input type="radio" name="direction" value="zl2gr" defaultChecked />
                      <span>zł → gr</span>
                    </label>
                    <label>
                      <input type="radio" name="direction" value="gr2zl" />
                      <span>gr → zł</span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="submit">Konwertuj</button>
          </form>
          <div className="result">
            <h2>Wynik</h2>
            <p id="summary">Tutaj pojawi się podsumowanie</p>
          </div>
        </div>
      </section>

      {/* ************ SEKCJA 2: MATRIXOWE KONWERTERY ************ */}
      <section className="matrix-section">
        {/* Canvas z deszczem znaków */}
        <canvas id="matrixCanvas"></canvas>
        {/* Kropka kursora */}
        <div id="cursorDot"></div>

        {/* Konwerter masy */}
        <div className="units-container" id="unitsContainer">
          <h2>Matrixowy Konwerter Jednostek (Masa)</h2>
          <form id="massConverterForm">
            <table>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="massValue">Ile jednostek?</label>
                  </td>
                  <td>
                    <input type="number" id="massValue" placeholder="np. 1000" required />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="fromUnit">Z:</label>
                  </td>
                  <td>
                    <select id="fromUnit">
                      <option value="gramy">Gramy</option>
                      <option value="dekagramy">Dekagramy</option>
                      <option value="kilogramy">Kilogramy</option>
                      <option value="tony">Tony</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="toUnit">Na:</label>
                  </td>
                  <td>
                    <select id="toUnit">
                      <option value="gramy">Gramy</option>
                      <option value="dekagramy">Dekagramy</option>
                      <option value="kilogramy">Kilogramy</option>
                      <option value="tony">Tony</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="submit">Przelicz</button>
          </form>
          <div className="matrix-result" id="massResult"></div>
        </div>

        {/* Konwerter długości */}
        <div className="units-container" id="lengthContainer">
          <h2>Matrixowy Konwerter Jednostek (Długość)</h2>
          <form id="lengthConverterForm">
            <table>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="lengthValue">Ile jednostek?</label>
                  </td>
                  <td>
                    <input type="number" id="lengthValue" placeholder="np. 123" required />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="lengthFrom">Z:</label>
                  </td>
                  <td>
                    <select id="lengthFrom">
                      <option value="mm">Milimetry</option>
                      <option value="cm">Centymetry</option>
                      <option value="dm">Decymetry</option>
                      <option value="m">Metry</option>
                      <option value="km">Kilometry</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="lengthTo">Na:</label>
                  </td>
                  <td>
                    <select id="lengthTo">
                      <option value="mm">Milimetry</option>
                      <option value="cm">Centymetry</option>
                      <option value="dm">Decymetry</option>
                      <option value="m">Metry</option>
                      <option value="km">Kilometry</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="submit">Konwertuj</button>
          </form>
          <div className="matrix-result" id="lengthResult"></div>
        </div>
      </section>
    </>
  );
}