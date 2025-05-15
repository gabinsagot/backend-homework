from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uuid import uuid4
import random

app = FastAPI()

# Middleware pour gérer les CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stockage en mémoire
grilles = {}  # grille de pixels
utilisateurs = {}    # user_id
deltas = {}   # liste de changements (deltas)

NX, NY = 20, 20  # taille par défaut

def generer_grille_vide(nx, ny):
    return [[[255, 255, 255] for _ in range(nx)] for _ in range(ny)]


#Preinitialisation de la grille
@app.get("/api/v1/{mapid}/preinit")
async def preinit(mapid: str):
    key = str(uuid4())
    utilisateurs[key] = None  
    if mapid not in grilles:
        grilles[mapid] = generer_grille_vide(NX, NY)
    return {"key": key}


#Initialisation de la grille
@app.get("/api/v1/{mapid}/init")
async def init(mapid: str, key: str):
    user_id = str(uuid4())
    utilisateurs[key] = user_id
    deltas[user_id] = []
    grille = grilles[mapid]
    return {"id": user_id, "nx": NX, "ny": NY, "data": grille}


#Récupération de la grille
@app.get("/api/v1/{mapid}/set/{user_id}/{y}/{x}/{r}/{g}/{b}")
async def set_pixel(mapid: str, user_id: str, y: int, x: int, r: int, g: int, b: int):
    if mapid not in grilles or user_id not in deltas:
        return JSONResponse(status_code=400, content={"error": "invalid request"})
    grilles[mapid][y][x] = [r, g, b]
    for uid in deltas:
        if uid != user_id:
            deltas[uid].append([y, x, r, g, b])
    return 0

@app.get("/api/v1/{mapid}/deltas")
async def get_deltas(mapid: str, id: str):
    if id not in deltas:
        return {"deltas": []}
    result = deltas[id]
    deltas[id] = []
    return {"deltas": result}
