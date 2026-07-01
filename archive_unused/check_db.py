import sys
import os
from sqlalchemy import create_engine, inspect

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

def inspect_campaign_fks():
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    
    print("Tables referencing 'campaigns':")
    for table_name in inspector.get_table_names():
        fks = inspector.get_foreign_keys(table_name)
        for fk in fks:
            if fk['referred_table'] == 'campaigns':
                print(f"Table: {table_name}, FK: {fk['constrained_columns']}, Referred: {fk['referred_columns']}, Options: {fk.get('options')}")

if __name__ == "__main__":
    inspect_campaign_fks()
