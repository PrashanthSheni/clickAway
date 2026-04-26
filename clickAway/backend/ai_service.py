import logging
import re
from typing import List, Dict

logger = logging.getLogger("prioritization-service")

# Keywords for prioritization
URGENT_KEYWORDS = [
    r"urgent", r"critical", r"deadline", r"emergency", r"asap", 
    r"client", r"customer", r"production", r"deal", r"closing"
]
IMPORTANT_KEYWORDS = [
    r"ceo", r"cto", r"v[po]", r"director", r"manager", 
    r"interview", r"presentation", r"board", r"investor"
]

def calculate_local_priority(title: str, notes: str) -> int:
    """
    Local rule-based priority calculation.
    Returns 1 (High), 2 (Medium), or 3 (Normal).
    """
    text = f"{title} {notes}".lower()
    
    # Check for urgent keywords
    is_urgent = any(re.search(word, text) for word in URGENT_KEYWORDS)
    # Check for important keywords (executives, etc.)
    is_important = any(re.search(word, text) for word in IMPORTANT_KEYWORDS)
    
    if is_urgent and is_important:
        return 1
    if is_urgent or is_important:
        # If very short note but has urgent keyword, definitely P1
        if len(text) < 50 and is_urgent:
            return 1
        return 2
    
    return 3

async def prioritize_bookings(bookings: List[Dict]) -> List[Dict]:
    """
    Smart rule-based prioritization that doesn't require external APIs.
    """
    logger.info(f"Running rule-based prioritization on {len(bookings)} bookings.")
    
    for b in bookings:
        title = b.get("title", "") or ""
        notes = b.get("notes", "") or ""
        
        # Base priority from text analysis
        priority = calculate_local_priority(title, notes)
        
        # Optional: Adjust based on user reliability score if available
        # If score is very high (95+), and it's a P2, maybe bump to P1?
        # For now, let's keep it simple and keyword-based as requested.
        
        b["ai_priority"] = priority
        
    # Sort bookings by priority for the manager (1 first, then 2, then 3)
    # This helps them see the most important ones at the top
    bookings.sort(key=lambda x: x.get("ai_priority", 3))
    
    return bookings
