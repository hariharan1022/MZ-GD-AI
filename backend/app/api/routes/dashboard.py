from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import random
import json

router = APIRouter()

@router.websocket("/ws")
async def dashboard_websocket(websocket: WebSocket):
    await websocket.accept()
    
    # Initial state
    students_participated = 44
    communication_score = 88
    
    leaderboard = [
        {"id": 1, "department": "Computer Science", "score": 850},
        {"id": 2, "department": "Electronics", "score": 820},
        {"id": 3, "department": "Mechanical", "score": 750},
        {"id": 4, "department": "Information Tech", "score": 710},
        {"id": 5, "department": "Civil", "score": 680},
    ]

    try:
        while True:
            # Simulate real-time data changes
            
            # Slightly adjust scores to simulate live activity
            for dept in leaderboard:
                change = random.randint(-5, 15)
                dept["score"] += change
                
            # Re-sort leaderboard based on new scores
            leaderboard.sort(key=lambda x: x["score"], reverse=True)
            
            # Occasionally add a new student participant
            if random.random() > 0.8:
                students_participated += 1
                
            # Fluctuate communication score slightly
            score_change = random.choice([-1, 0, 1])
            communication_score = max(0, min(100, communication_score + score_change))
            
            payload = {
                "leaderboard": leaderboard,
                "discussions": {
                    "prepTime": "2 Min Prep",
                    "discussionTime": "10 Min Discussion"
                },
                "currentLevel": "Intermediate Level 3",
                "systemAnalytics": {
                    "studentsParticipated": students_participated,
                    "groups": 10 + (students_participated // 5) - 8 # just fake some math to look real
                },
                "overview": {
                    "dailyStreak": 5,
                    "communicationScore": communication_score
                },
                "badgesEarned": [
                    {"name": "Top Speaker", "icon": "Speaker"},
                    {"name": "Grammar Guru", "icon": "Book"},
                    {"name": "Active Listener", "icon": "Ear"}
                ]
            }
            
            await websocket.send_text(json.dumps(payload))
            
            # Send update every 2 seconds
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        print("Client disconnected from dashboard websocket")
