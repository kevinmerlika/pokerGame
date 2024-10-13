import db from '../db/DBConnection'; // Adjust the path as needed
import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2'; // Import OkPacket and RowDataPacket

interface User extends RowDataPacket {
    id: string;
    name: string;
    balance: number;
}

export class UserService {
    async getUserById(userId: string): Promise<any | null> {
        try {
            // Check if userId is valid
            if (!userId) {
                console.warn('No userId provided.');
                return null;
            }
    
            // Execute the query and use any for the result type
            const result: any = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
            // Extract rows from the result as an object
            const rows: any = result; // Assume the first element contains the user data
    
            // Log the fetched rows
            console.log("Fetched rows:", rows);
    
            // Get the user if rows exist
            const user = rows && rows.length > 0 ? rows[0] : null;
    
            console.log('User:', user);
            return user;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error; // Optional: rethrow the error to handle it elsewhere
        }
    }
    
    
    
    async updateBalance(userId: string, amount: number): Promise<boolean> {
        try {
            // Check if user exists

            const existingUser = await this.getUserById(userId);

            // If user does not exist, create a dummy user
            if (!existingUser) {
                await db.query('INSERT INTO users (id, balance) VALUES (?, ?)', [userId, 0]); // Set initial balance to 0 or any value
            }

            // Now update the balance
            const result = await db.query('UPDATE users SET balance =  ? WHERE id = ?', [amount, userId]);
            
            if (!result || !(result as ResultSetHeader).affectedRows) {
                console.error('No rows affected by the update query.');
                return false; // If no rows were affected
            }

            return (result as ResultSetHeader).affectedRows > 0; // Cast result to ResultSetHeader
        } catch (error) {
            console.error('Error updating user balance:', error);
            throw error; // Optional: rethrow the error to handle it elsewhere
        }
    }


    async getPlayerBalance(userId: string): Promise<number | null> {
        try {
            // Check if userId is valid
            if (!userId) {
                console.warn('No userId provided.');
                return null;
            }

            // Execute the query to fetch the balance
            const result: any = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);

            // Extract rows from the result
            const rows: any = result; // Assuming the first element contains the user data

            // Log the fetched rows
            console.log("Fetched balance rows:", rows);

            // Get the balance if rows exist
            let balance = rows && rows.length > 0 ? parseFloat(rows[0].balance) : null;

            if(balance == null){
                balance = 1000;
            }
            console.log('User balance:', balance);
            return balance;
        } catch (error) {
            console.error('Error fetching user balance:', error);
            throw error; // Optional: rethrow the error to handle it elsewhere
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const [rows]: [User[]] = await db.query('SELECT * FROM users') as [User[]];
            
            if (!rows) {
                console.error('No users found in the database.');
                return []; // Return an empty array if no users are found
            }

            return rows; // Return all users
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error; // Optional: rethrow the error to handle it elsewhere
        }
    }
}
