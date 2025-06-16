import requests
from datetime import datetime
import math
import os

class IslamicDataService:
    """Service for fetching Islamic data from external APIs"""
    
    @staticmethod
    def get_prayer_times(latitude, longitude, date=None):
        """Get prayer times for a specific location"""
        try:
            if not date:
                date = datetime.now()
            
            formatted_date = f"{date.day:02d}-{date.month:02d}-{date.year}"
            url = f"http://api.aladhan.com/v1/timings/{formatted_date}"
            
            params = {
                'latitude': latitude,
                'longitude': longitude,
                'method': 4  # Umm Al-Qura method
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                timings = data['data']['timings']
                
                return {
                    'success': True,
                    'prayer_times': {
                        'fajr': timings['Fajr'],
                        'dhuhr': timings['Dhuhr'],
                        'asr': timings['Asr'],
                        'maghrib': timings['Maghrib'],
                        'isha': timings['Isha']
                    },
                    'date': data['data']['date']['readable'],
                    'location': f"({latitude:.2f}, {longitude:.2f})"
                }
            else:
                return {
                    'success': False,
                    'error': 'Unable to fetch prayer times'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_islamic_date():
        """Get current Islamic date"""
        try:
            url = "http://api.aladhan.com/v1/gToH"
            today = datetime.now()
            
            params = {
                'date': f"{today.day:02d}-{today.month:02d}-{today.year}"
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                hijri = data['data']['hijri']
                
                return {
                    'success': True,
                    'islamic_date': {
                        'day': hijri['day'],
                        'month': hijri['month']['en'],
                        'month_ar': hijri['month']['ar'],
                        'year': hijri['year'],
                        'weekday': hijri['weekday']['en'],
                        'weekday_ar': hijri['weekday']['ar']
                    }
                }
            else:
                return {
                    'success': False,
                    'error': 'Unable to fetch Islamic date'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_quran_surah(surah_number):
        """Get Quran surah from API"""
        try:
            url = f"http://api.alquran.cloud/v1/surah/{surah_number}/ar.alafasy"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'surah': data['data']
                }
            else:
                return {
                    'success': False,
                    'error': 'Unable to fetch surah'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Islamic cities data
ISLAMIC_CITIES = {
    'mecca': {'name': 'مكة المكرمة، السعودية', 'lat': 21.3891, 'lng': 39.8579, 'timezone': 'Asia/Riyadh'},
    'medina': {'name': 'المدينة المنورة، السعودية', 'lat': 24.5247, 'lng': 39.5692, 'timezone': 'Asia/Riyadh'},
    'jerusalem': {'name': 'القدس، فلسطين', 'lat': 31.7683, 'lng': 35.2137, 'timezone': 'Asia/Jerusalem'},
    'cairo': {'name': 'القاهرة، مصر', 'lat': 30.0444, 'lng': 31.2357, 'timezone': 'Africa/Cairo'},
    'riyadh': {'name': 'الرياض، السعودية', 'lat': 24.7136, 'lng': 46.6753, 'timezone': 'Asia/Riyadh'},
    'dubai': {'name': 'دبي، الإمارات', 'lat': 25.2048, 'lng': 55.2708, 'timezone': 'Asia/Dubai'},
    'istanbul': {'name': 'إسطنبول، تركيا', 'lat': 41.0082, 'lng': 28.9784, 'timezone': 'Europe/Istanbul'},
    'kuala_lumpur': {'name': 'كوالالمبور، ماليزيا', 'lat': 3.1390, 'lng': 101.6869, 'timezone': 'Asia/Kuala_Lumpur'}
}

# Default Islamic phrases for Tasbeh
ISLAMIC_PHRASES = [
    "سبحان الله",  # SubhanAllah
    "الحمد لله",   # Alhamdulillah
    "الله أكبر",   # Allahu Akbar
    "لا إله إلا الله",  # La ilaha illa Allah
    "اللهم صل على سيدنا محمد",  # Allahumma salli ala sayyidina Muhammad
    "أستغفر الله",  # Astaghfirullah
    "لا حول ولا قوة إلا بالله",  # La hawla wa la quwwata illa billah
    "بسم الله الرحمن الرحيم"  # Bismillah ar-Rahman ar-Raheem
]

# Hadith collection
HADITH_COLLECTION = [
    {
        "arabic": "من قال سبحان الله وبحمده في يوم مائة مرة حطت خطاياه وإن كانت مثل زبد البحر",
        "translation": "Whoever says 'SubhanAllahi wa bihamdihi' 100 times a day, his sins will be wiped away even if they were like the foam of the sea",
        "narrator": "رواه البخاري ومسلم"
    },
    {
        "arabic": "أحب الكلام إلى الله أربع: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
        "translation": "The most beloved words to Allah are four: SubhanAllah, Alhamdulillah, La ilaha illa Allah, and Allahu Akbar",
        "narrator": "رواه مسلم"
    },
    {
        "arabic": "الدعاء مخ العبادة",
        "translation": "Supplication is the essence of worship",
        "narrator": "رواه الترمذي"
    }
]
