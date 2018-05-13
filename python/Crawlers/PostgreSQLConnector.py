import psycopg2
from config import config
class PostgresConnector:

    def __init__(self):
        # read connection parameters
        self.params = config()
    def connect(self):
        """ Connect to the PostgreSQL database server """
        conn = None
        try:
            # connect to the PostgreSQL server
            print('Connecting to the PostgreSQL database...')
            conn = psycopg2.connect(**self.params)
            # create a cursor
            cur = conn.cursor()

            # execute a statement
            print('PostgreSQL database version:')
            cur.execute('SELECT version()')

            # display the PostgreSQL database server version
            db_version = cur.fetchone()
            print(db_version)

            # close the communication with the PostgreSQL
            cur.close()
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
        finally:
            if conn is not None:
                # conn.close()
                # print('Database connection closed.')
                return conn



if __name__ == '__main__':
    postgres = PostgresConnector()

    connObj = postgres.connect()
    cur = connObj.cursor()
    # cur.execute("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name= 'Tweets'")        ## for the SCHEMA
    # cur.execute("SELECT count('Tweets') FROM \"Tweets\" where label = 'sexism'")    ## SELECT QUERY
    # cur.execute("SELECT * FROM c")    ## SELECT QUERY
    cur.execute("SELECT * FROM \"LabeledWords\" where oxford_sexist > 0 order by word")
    # cur.execute("SELECT * FROM \"LabeledWords\" where word=\'\'")

    # show the results of the query
    for row in cur:
        print(row)



    cur.close()
    connObj.commit()  # You have to commit in order to make actual changes to the DB