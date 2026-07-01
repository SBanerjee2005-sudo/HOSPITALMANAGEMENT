import os
import sys

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models import Hospital

hospitals_to_add = [
    {"name": "SSKM Hospital", "lat": 22.5395, "lng": 88.3433, "district": "Bhowanipore", "rating": 4.5, "is_active": True, "beds": 200, "doctors": 50},
    {"name": "CMRI", "lat": 22.5323, "lng": 88.3292, "district": "Alipore", "rating": 4.3, "is_active": True, "beds": 150, "doctors": 40},
    {"name": "Woodlands Hospital", "lat": 22.5307, "lng": 88.3308, "district": "Alipore", "rating": 4.6, "is_active": True, "beds": 180, "doctors": 45},
    {"name": "AMRI Hospitals Dhakuria", "lat": 22.5135, "lng": 88.3621, "district": "Dhakuria", "rating": 4.4, "is_active": True, "beds": 160, "doctors": 35},
    {"name": "Ruby General Hospital", "lat": 22.5126, "lng": 88.4035, "district": "Anandapur", "rating": 4.2, "is_active": True, "beds": 120, "doctors": 30},
    {"name": "Peerless Hospital", "lat": 22.4831, "lng": 88.3976, "district": "Panchasayar", "rating": 4.1, "is_active": True, "beds": 220, "doctors": 55},
    {"name": "Medica Superspecialty Hospital", "lat": 22.4820, "lng": 88.4022, "district": "Mukundapur", "rating": 4.7, "is_active": True, "beds": 300, "doctors": 80},
    {"name": "R N Tagore International Institute of Cardiac Sciences", "lat": 22.4822, "lng": 88.3995, "district": "Mukundapur", "rating": 4.8, "is_active": True, "beds": 250, "doctors": 70},
    {"name": "Tata Medical Center", "lat": 22.5739, "lng": 88.4800, "district": "New Town", "rating": 4.9, "is_active": True, "beds": 400, "doctors": 100},
    {"name": "Manipal Hospital", "lat": 22.5759, "lng": 88.4357, "district": "Salt Lake", "rating": 4.4, "is_active": True, "beds": 180, "doctors": 40},
    {"name": "Charnock Hospital", "lat": 22.6288, "lng": 88.4419, "district": "Tegharia", "rating": 4.0, "is_active": True, "beds": 100, "doctors": 25},
    {"name": "Bhagirathi Neotia Woman and Child Care Centre", "lat": 22.5451, "lng": 88.3533, "district": "Park Street", "rating": 4.6, "is_active": True, "beds": 80, "doctors": 20},
    {"name": "Belle Vue Clinic", "lat": 22.5447, "lng": 88.3512, "district": "Elgin", "rating": 4.5, "is_active": True, "beds": 140, "doctors": 35},
    {"name": "B M Birla Heart Research Centre", "lat": 22.5307, "lng": 88.3323, "district": "Alipore", "rating": 4.7, "is_active": True, "beds": 110, "doctors": 30},
    {"name": "Calcutta National Medical College", "lat": 22.5513, "lng": 88.3712, "district": "Beniapukur", "rating": 4.0, "is_active": True, "beds": 500, "doctors": 120},
    {"name": "NRS Medical College and Hospital", "lat": 22.5630, "lng": 88.3662, "district": "Sealdah", "rating": 4.1, "is_active": True, "beds": 600, "doctors": 150},
    {"name": "R G Kar Medical College and Hospital", "lat": 22.6026, "lng": 88.3756, "district": "Shyambazar", "rating": 4.0, "is_active": True, "beds": 550, "doctors": 130},
    {"name": "Medical College and Hospital", "lat": 22.5746, "lng": 88.3614, "district": "College Square", "rating": 4.3, "is_active": True, "beds": 650, "doctors": 160}
]

def main():
    db = SessionLocal()
    
    # Get highest current ID
    highest_id = db.query(Hospital).order_by(Hospital.id.desc()).first()
    next_id = highest_id.id + 1 if highest_id else 1
    
    for h_data in hospitals_to_add:
        # Check if exists
        exists = db.query(Hospital).filter(Hospital.name == h_data["name"]).first()
        if not exists:
            h = Hospital(
                id=next_id,
                name=h_data["name"],
                lat=h_data["lat"],
                lng=h_data["lng"],
                district=h_data["district"],
                rating=h_data["rating"],
                is_active=h_data["is_active"],
                beds=h_data["beds"],
                doctors=h_data["doctors"]
            )
            db.add(h)
            next_id += 1
            print(f"Added {h.name}")
        else:
            # Update lat lng just in case
            exists.lat = h_data["lat"]
            exists.lng = h_data["lng"]
            print(f"Updated {exists.name}")
    
    db.commit()
    print("Done adding Kolkata hospitals!")

if __name__ == '__main__':
    main()
