import os
import redis
import psycopg2

LIST_NAME = "voting_queue"


# Generally stored as secret keys but just to keep the app simple, keeping them has hard coded value
DB_HOST = "pg-container" 
DB_PORT = "5432"
DB_NAME = "votes"
DB_USER = "admin"
DB_PASSWORD = "admin"


UPDATE_VOTE_QUERY = """
UPDATE vote_counts 
SET count = count + 1 
WHERE option = %s;
"""

def update_vote(vote):
    """Update the vote count in the database."""
    if vote not in ["yes", "no"]:
        print("Invalid vote! Use 'yes' or 'no'.")
        return
    
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()
        
        # Update vote count
        cur.execute(UPDATE_VOTE_QUERY, (vote,))
        conn.commit()

        print(f"Vote for '{vote}' counted successfully.")

        cur.close()
    except Exception as e:
        print("Error:", e)
    finally:
        if conn:
            conn.close()
            
def main():
    r = redis.Redis(host='redis', port=6379, decode_responses=True)
    print(f"Worker started, waiting for messages in {LIST_NAME}...")

    while True:
        message = r.brpop(LIST_NAME)  
        if message:
            print(f"Received: {message[1]}")
            update_vote(message[1])

if __name__ == "__main__":
    main()
