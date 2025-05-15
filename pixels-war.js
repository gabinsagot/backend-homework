// Pixel War
const PIXEL_URL = "http://localhost:8080";
const MAP_ID = "0000";
let matrice = [];



function xy(ca) {
    i = ca.id;
    return [parseInt(i.slice(0, 2)), parseInt(i.slice(2))];
}


function grDiv(i, j) {
    return document.getElementById(i + " " + j);
}


function couleurCss(triplet) {
    return `rgb(${triplet[0]}, ${triplet[1]}, ${triplet[2]})`;
}


document.addEventListener("DOMContentLoaded", async () => {

    const PREFIX = `${PIXEL_URL}/api/v1/${MAP_ID}`;

    document.getElementById("baseurl").value = PIXEL_URL;
    document.getElementById("mapid").value = MAP_ID;
    document.getElementById("baseurl").readOnly = true;
    document.getElementById("mapid").readOnly  = true;


    fetch(`${PREFIX}/preinit`, {credentials: "include"})
        .then((response) => response.json())
        .then( async (json) => {

            console.log(json);
            const key = json.key;
            console.log(PREFIX + `/init?key=${key}`);
            const initResponse = await (await fetch(PREFIX + `/init?key=${key}`, {credentials: "include"})).json();
            console.log(initResponse);
            const user_id = initResponse.id;
            // console.log("aaa", user_id);
            const nx = initResponse.nx;
            const ny = initResponse.ny;
            matrice = initResponse.data;

            let colSelect = getPickedColorInRGB();
            console.log(colSelect);
            let gridHTML = document.getElementById("grid");
            console.log(gridHTML);
            console.log(nx, ny);

            for(let y = 0; y<ny; y++){

                d = document.createElement("div");
                d.setAttribute("id", "l" + y);
                d.classList.add("ligne");
                gridHTML.appendChild(d);

                for(let x = 0; x<nx; x++){
                    s = document.createElement("div");
                    s.classList.add("case");
                    s.setAttribute("id", x + " " + y);
                    s.style.backgroundColor = couleurCss(matrice[y][x]);
                    d.appendChild(s);
                }
            }

            console.log(user_id);
            document.getElementById("refresh").addEventListener("click", async () => refresh(user_id));
            document.getElementById("colorpicker").addEventListener("change", () => {
                colSelect = getPickedColorInRGB();
            })

                

            gridHTML.addEventListener("click", async (event) => {
                
                console.log(event.target);
                coords = xy(event.target);
                x = coords[0];
                y = coords[1];
                console.log(PREFIX + `/set/${user_id}/${y}/${x}/${colSelect[0]}/${colSelect[1]}/${colSelect[2]}`);

                let succes = await(await fetch(PREFIX + `/set/${user_id}/${y}/${x}/${colSelect[0]}/${colSelect[1]}/${colSelect[2]}`, {credentials: "include"})).json();
                if(succes === 0){
                    event.target.style.backgroundColor = couleurCss(colSelect);
                    let temps = 9500;
                    let intervalle = setInterval(() => {
                        
                    document.getElementById("compteur").textContent = temps/1000;
                    if (temps <= 0){
                        clearInterval(intervalle);
                    }
                    temps-=500;
                    console.log("oui");}, 500);

                }
            })


        })

        
    // Fonction pour rafraîchir la grille
    async function refresh(user_id) {
        fetch(`${PREFIX}/deltas?id=${user_id}`, {credentials: "include"})
            .then((response) => response.json())
            .then((json) => {
                let deltas = json.deltas;
                console.log(deltas)
                for(const elt of deltas){
                    grDiv(elt[1], elt[0]).style.backgroundColor = couleurCss(elt.slice(2, 5))
                    // matrice[]
                }
            })
    }

    // Fonction pour récupérer la couleur choisie dans le color picker
    function getPickedColorInRGB() {
        const colorHexa = document.getElementById("colorpicker").value

        const r = parseInt(colorHexa.substring(1, 3), 16);
        const g = parseInt(colorHexa.substring(3, 5), 16);
        const b = parseInt(colorHexa.substring(5, 7), 16);

        return [r, g, b];
    }


    function pickColorFrom(div) {

        const bg = window.getComputedStyle(div).backgroundColor;
        const [r, g, b] = bg.match(/\d+/g);
        // on convertit en hexadécimal
        const rh = parseInt(r).toString(16).padStart(2, '0');
        const gh = parseInt(g).toString(16).padStart(2, '0');
        const bh = parseInt(b).toString(16).padStart(2, '0');
        const hex = `#${rh}${gh}${bh}`
        // on met la couleur dans le color picker
        document.getElementById("colorpicker").value = hex
    }

})
