require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
const uuidv4 = require('uuid').v4;
const cookieParser = require('cookie-parser');

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Romania1989!",
    database: process.env.DB_NAME || "cruddatabase",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1); // Exit the process if database connection fails
    }
    console.log('Successfully connected to database');
    connection.release();
});

// Check if admin_actions table exists and create it if it doesn't
db.query(`
  CREATE TABLE IF NOT EXISTS admin_actions (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    action_type ENUM('approve', 'make_admin', 'delete') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) {
    console.error('Error creating admin_actions table:', err);
  } else {
    console.log('admin_actions table created or already exists');
  }
});

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const token = req.cookies.session_token;
  
  if (!token) {
    return res.status(401).send('Authentication required');
  }

  const sqlSelect = "SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()";
  db.query(sqlSelect, [token], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).send('Invalid or expired token');
    }
    
    req.userId = results[0].user_id;
    next();
  });
};

const corsOptions = {
  origin: ['http://217.154.63.245:3000', 'http://217.154.63.245', 'http://localhost:3000', 'http://ao-tech.co.uk', 'http://217.154.63.245'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.options('*', cors(corsOptions)); // Enable preflight requests for all routes


app.post('/api/insert', (req, res) => {
  const name = req.body.name;
  const age = req.body.age;
  const type = req.body.type;
  const id = uuidv4();

  const sqlInsert = "INSERT INTO members (id, name, age, type) VALUES (?, ?, ?, ?)";
  db.query(sqlInsert, [id, name, age, type], (err, results) => {
    if (err) {
      res.status(500).send("Failed to submit review");
    } else {
      res.status(200).send("Review submitted successfully");
    }
  });
});

// Endpoint to fetch all users
app.get('/api/users', (req, res) => {
  const sqlSelect = "SELECT * FROM members";
  db.query(sqlSelect, (err, results) => {
    if (err) {
      res.status(500).send("Failed to fetch users");
    } else {
      res.status(200).json(results);
    }
  });
});


// Endpoint to fetch user details by ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  // First check if it's a member
  const memberSql = "SELECT * FROM members WHERE id = ?";
  db.query(memberSql, [userId], (err, memberResults) => {
    if (err) {
      return res.status(500).send("Failed to fetch user details");
    }
    
    if (memberResults.length > 0) {
      return res.status(200).json(memberResults[0]);
    }

    // If not a member, check if it's a user
    const userSql = "SELECT * FROM users WHERE id = ?";
    db.query(userSql, [userId], (err, userResults) => {
      if (err) {
        return res.status(500).send("Failed to fetch user details");
      }
      
      if (userResults.length > 0) {
        return res.status(200).json(userResults[0]);
      }
      
      // If not found in either table
      return res.status(404).send("User not found");
    });
  });
});


// Endpoint to update a user
app.put('/api/update/:userId', (req, res) => {
  const userId = req.params.userId;
  const newName = req.body.name;
  const newAge = req.body.age;
  const newType = req.body.type;

  const sqlUpdate = "UPDATE members SET name = ?, age = ?, type = ? WHERE id = ?";
  db.query(sqlUpdate, [newName, newAge, newType, userId], (err, results) => {
    if (err) {
      res.status(500).send("Failed to update user");
    } else {
      res.status(200).send("User updated successfully");
    }
  });
});


// Endpoint to delete a user
app.delete('/api/delete/:userId', (req, res) => {
  const userId = req.params.userId;

  const sqlDelete = "DELETE FROM members WHERE id = ?";
  db.query(sqlDelete, [userId], (err, results) => {
    if (err) {
      res.status(500).send("Failed to delete user");
    } else {
      res.status(200).send("User deleted successfully");
    }
  });
});

// Validation middleware
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Invalid email format");
  }

  // Password criteria validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).send("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
  }

  // Username length validation
  if (username.length < 3 || username.length > 20) {
    return res.status(400).send("Username must be between 3 and 20 characters");
  }

  next();
};

// Modified register endpoint with validation
app.post('/api/register', validateRegistration, (req, res) => {
  const { username, email, password } = req.body;
  const id = uuidv4();

  // Check if username or email already exists
  const checkUser = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.query(checkUser, [username, email], (err, results) => {
    if (err) {
      res.status(500).send("Database error");
    } else if (results.length > 0) {
      // Check which field is duplicate
      const duplicateField = results[0].username === username ? "username" : "email";
      res.status(400).send(`This ${duplicateField} is already in use`);
    } else {
      // Insert new user
      const sqlInsert = "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)";
      db.query(sqlInsert, [id, username, email, password], (err) => {
        if (err) {
          res.status(500).send("Failed to register user");
        } else {
          res.status(200).send("User registered successfully");
        }
      });
    }
  });
});

// Modified login endpoint with better error handling
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username exists
  const checkUsername = "SELECT * FROM users WHERE username = ?";
  db.query(checkUsername, [username], (err, results) => {
    if (err) {
      res.status(500).send("Database error");
    } else if (results.length === 0) {
      res.status(401).send("Username not found");
    } else {
      // Check if user is approved
      if (!results[0].is_approved) {
        return res.status(403).send("Account pending approval. Please contact an administrator.");
      }

      // Check password
      const sqlSelect = "SELECT * FROM users WHERE username = ? AND password = ?";
      db.query(sqlSelect, [username, password], (err, results) => {
        if (err) {
          res.status(500).send("Database error");
        } else if (results.length === 0) {
          res.status(401).send("Incorrect password");
        } else {
          const userId = results[0].id;
          const token = uuidv4();
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

          // Store session in database
          const sqlInsert = "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)";
          db.query(sqlInsert, [uuidv4(), userId, token, expiresAt], (err) => {
            if (err) {
              res.status(500).send("Failed to create session");
            } else {
              // Set HTTP-only cookie
              res.cookie('session_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: expiresAt,
                path: '/'
              });

              res.status(200).json({ 
                message: "Login successful",
                user: {
                  id: results[0].id,
                  username: results[0].username,
                  email: results[0].email,
                  is_admin: results[0].is_admin
                }
              });
            }
          });
        }
      });
    }
  });
});

// Logout endpoint
app.post('/api/logout', authenticateToken, (req, res) => {
  const token = req.cookies.session_token;
  
  const sqlDelete = "DELETE FROM sessions WHERE token = ?";
  db.query(sqlDelete, [token], (err) => {
    if (err) {
      res.status(500).send("Failed to logout");
    } else {
      // Clear the cookie
      res.clearCookie('session_token');
      res.status(200).send("Logged out successfully");
    }
  });
});

// Check session endpoint
app.get('/api/check-session', authenticateToken, (req, res) => {
  res.status(200).json({ valid: true, userId: req.userId });
});

// Create a new training session
app.post('/api/training-sessions', (req, res) => {
  const { id, date, members } = req.body;
  
  // Get a connection from the pool
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Failed to create training session' });
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Failed to create training session' });
      }

      // Insert the training session
      connection.query(
        'INSERT INTO training_sessions (id, date) VALUES (?, ?)',
        [id, date],
        (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error('Error creating training session:', err);
              res.status(500).json({ error: 'Failed to create training session' });
            });
          }

          // Insert session members with payment status and details
          const memberValues = members.map(member => [
            id, 
            member.id, 
            member.paymentStatus || 'unpaid',
            member.details || null
          ]);
          
          connection.query(
            'INSERT INTO training_session_members (session_id, member_id, payment_status, details) VALUES ?',
            [memberValues],
            (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Error adding members to session:', err);
                  res.status(500).json({ error: 'Failed to add members to session' });
                });
              }

              // Commit the transaction
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Error committing transaction:', err);
                    res.status(500).json({ error: 'Failed to create training session' });
                  });
                }
                connection.release();
                res.status(201).json({ message: 'Training session created successfully' });
              });
            }
          );
        }
      );
    });
  });
});

// Get all training sessions with their members
app.get('/api/training-sessions', (req, res) => {
  db.query(`
    SELECT 
      ts.id,
      ts.date,
      ts.created_at,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', m.id,
          'name', m.name,
          'age', m.age,
          'type', m.type,
          'paymentStatus', tsm.payment_status,
          'details', tsm.details
        )
      ) as members
    FROM training_sessions ts
    LEFT JOIN training_session_members tsm ON ts.id = tsm.session_id
    LEFT JOIN members m ON tsm.member_id = m.id
    GROUP BY ts.id
    ORDER BY ts.date DESC
  `, (err, result) => {
    if (err) {
      console.error('Error fetching training sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch training sessions' });
    }

    // Parse the members JSON strings
    const sessions = result.map(session => ({
      ...session,
      members: session.members ? JSON.parse(`[${session.members}]`) : []
    }));

    res.json(sessions);
  });
});

// Get a single training session by ID
app.get('/api/training-sessions/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  console.log('Session ID:', sessionId);
  console.log('Fetching session with ID:', sessionId); // Debug log
  
  db.query(`
    SELECT 
      ts.id,
      DATE_FORMAT(ts.date, '%Y-%m-%d') as date,
      ts.created_at,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', m.id,
          'name', m.name,
          'age', m.age,
          'type', m.type,
          'paymentStatus', tsm.payment_status,
          'details', tsm.details
        )
      ) as members
    FROM training_sessions ts
    LEFT JOIN training_session_members tsm ON ts.id = tsm.session_id
    LEFT JOIN members m ON tsm.member_id = m.id
    WHERE ts.id = ?
    GROUP BY ts.id
  `, [sessionId], (err, result) => {
    if (err) {
      console.error('Error fetching training session:', err);
      return res.status(500).json({ error: 'Failed to fetch training session' });
    }

    console.log('Query result:', result); // Debug log

    if (!result || result.length === 0) {
      console.log('No session found with ID:', sessionId); // Debug log
      return res.status(404).json({ error: 'Training session not found' });
    }

    try {
      // Parse the members JSON strings
      const session = {
        ...result[0],
        members: result[0].members ? JSON.parse(`[${result[0].members}]`) : []
      };
      console.log('Sending session data:', session); // Debug log
      res.json(session);
    } catch (parseError) {
      console.error('Error parsing session data:', parseError);
      res.status(500).json({ error: 'Failed to parse session data' });
    }
  });
});

// Update a training session
app.put('/api/training-sessions/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const { date, members } = req.body;
  
  // Get a connection from the pool
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Failed to update training session' });
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Failed to update training session' });
      }

      // Update the training session date
      connection.query(
        'UPDATE training_sessions SET date = ? WHERE id = ?',
        [date, sessionId],
        (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error('Error updating training session:', err);
              res.status(500).json({ error: 'Failed to update training session' });
            });
          }

          // Delete existing members
          connection.query(
            'DELETE FROM training_session_members WHERE session_id = ?',
            [sessionId],
            (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Error deleting existing members:', err);
                  res.status(500).json({ error: 'Failed to update training session' });
                });
              }

              // Insert updated members
              const memberValues = members.map(member => [
                sessionId, 
                member.id, 
                member.paymentStatus || 'unpaid',
                member.details || null
              ]);
              
              connection.query(
                'INSERT INTO training_session_members (session_id, member_id, payment_status, details) VALUES ?',
                [memberValues],
                (err, result) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Error updating members:', err);
                      res.status(500).json({ error: 'Failed to update training session' });
                    });
                  }

                  // Commit the transaction
                  connection.commit((err) => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        console.error('Error committing transaction:', err);
                        res.status(500).json({ error: 'Failed to update training session' });
                      });
                    }
                    connection.release();
                    res.status(200).json({ message: 'Training session updated successfully' });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

// Delete a training session
app.delete('/api/training-sessions/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  // Get a connection from the pool
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({ error: 'Failed to delete training session' });
    }

    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Failed to delete training session' });
      }

      // Delete the training session (cascade will handle the members)
      connection.query(
        'DELETE FROM training_sessions WHERE id = ?',
        [sessionId],
        (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error('Error deleting training session:', err);
              res.status(500).json({ error: 'Failed to delete training session' });
            });
          }

          // Commit the transaction
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error committing transaction:', err);
                res.status(500).json({ error: 'Failed to delete training session' });
              });
            }
            connection.release();
            res.status(200).json({ message: 'Training session deleted successfully' });
          });
        }
      );
    });
  });
});

// Get total number of training sessions
app.get('/api/training-sessions/count', (req, res) => {
  const timePeriod = req.query.period || 'overall';
  
  console.log('Time period:', timePeriod);
  
  let dateFilter = '';
  
  // Add date filter based on time period
  switch (timePeriod) {
    case '1month':
      dateFilter = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
      break;
    case '3months':
      dateFilter = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
      break;
    case '6months':
      dateFilter = 'WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
      break;
    default:
      // 'overall' - no date filter
      break;
  }
  
  const sql = `SELECT COUNT(*) as count FROM training_sessions ${dateFilter}`;
  console.log('Executing SQL:', sql);
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching total sessions count:', err);
      return res.status(500).json({ error: 'Failed to fetch total sessions count' });
    }
    console.log('Query result:', result);
    if (result && result.length > 0) {
      res.json({ total_sessions: result[0].count });
    } else {
      res.json({ total_sessions: 0 });
    }
  });
});

// Get member's training session attendance
app.get('/api/members/:memberId/training-sessions', (req, res) => {
  const memberId = req.params.memberId;
  const timePeriod = req.query.period || 'overall';
  
  let dateFilter = '';
  const params = [memberId];
  
  // Add date filter based on time period
  switch (timePeriod) {
    case '1month':
      dateFilter = 'AND ts.date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
      break;
    case '3months':
      dateFilter = 'AND ts.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
      break;
    case '6months':
      dateFilter = 'AND ts.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
      break;
    default:
      // 'overall' - no date filter
      break;
  }
  
  db.query(`
    SELECT 
      ts.id,
      DATE_FORMAT(ts.date, '%Y-%m-%d') as date,
      tsm.payment_status,
      tsm.details
    FROM training_sessions ts
    JOIN training_session_members tsm ON ts.id = tsm.session_id
    WHERE tsm.member_id = ? ${dateFilter}
    ORDER BY ts.date DESC
  `, params, (err, result) => {
    if (err) {
      console.error('Error fetching member training sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch training sessions' });
    }
    res.json(result);
  });
});

// Get all members
app.get('/api/members', (req, res) => {
  const sqlSelect = "SELECT * FROM members ORDER BY name";
  db.query(sqlSelect, (err, results) => {
    if (err) {
      console.error('Error fetching members:', err);
      return res.status(500).json({ error: 'Failed to fetch members' });
    }
    res.json(results);
  });
});

// Endpoint to update user admin and approval status
app.put('/api/users/:userId/update-status', (req, res) => {
  const userId = req.params.userId;
  const { is_admin, is_approved } = req.body;

  const sqlUpdate = "UPDATE users SET is_admin = ?, is_approved = ? WHERE id = ?";
  db.query(sqlUpdate, [is_admin, is_approved, userId], (err, results) => {
    if (err) {
      console.error('Error updating user status:', err);
      res.status(500).send("Failed to update user status");
    } else if (results.affectedRows === 0) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send("User status updated successfully");
    }
  });
});

// Get all users for admin management
app.get('/api/admin/users', authenticateToken, (req, res) => {
  // First check if the requesting user is an admin
  const checkAdminSql = "SELECT is_admin FROM users WHERE id = ?";
  db.query(checkAdminSql, [req.userId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (results.length === 0 || results[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // If user is admin, fetch all users
    const sqlSelect = "SELECT id, username, email, is_admin, is_approved, created_at FROM users ORDER BY created_at DESC";
    db.query(sqlSelect, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(results);
    });
  });
});

// Make a user an admin
app.put('/api/admin/users/:userId/make-admin', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  
  // First check if the requesting user is an admin
  const checkAdminSql = "SELECT is_admin FROM users WHERE id = ?";
  db.query(checkAdminSql, [req.userId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (results.length === 0 || results[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // If user is admin, update the target user's admin status
    const sqlUpdate = "UPDATE users SET is_admin = 1 WHERE id = ?";
    db.query(sqlUpdate, [userId], (err, result) => {
      if (err) {
        console.error('Error making user admin:', err);
        return res.status(500).json({ error: 'Failed to make user admin' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User is now an admin' });
    });
  });
});

// Approve a user
app.put('/api/admin/users/:userId/approve', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  
  // First check if the requesting user is an admin
  const checkAdminSql = "SELECT is_admin FROM users WHERE id = ?";
  db.query(checkAdminSql, [req.userId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (results.length === 0 || results[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // If user is admin, approve the target user
    const sqlUpdate = "UPDATE users SET is_approved = 1 WHERE id = ?";
    db.query(sqlUpdate, [userId], (err, result) => {
      if (err) {
        console.error('Error approving user:', err);
        return res.status(500).json({ error: 'Failed to approve user' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User approved successfully' });
    });
  });
});

// Delete a user (admin only)
app.delete('/api/admin/users/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  console.log('Attempting to delete user:', userId);
  
  // First check if the requesting user is an admin
  const checkAdminSql = "SELECT is_admin FROM users WHERE id = ?";
  db.query(checkAdminSql, [req.userId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (results.length === 0 || results[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Delete the user directly
    const deleteUserSql = "DELETE FROM users WHERE id = ?";
    db.query(deleteUserSql, [userId], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: 'Failed to delete user: ' + err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  });
});

// Update approve user endpoint to log action
app.put('/api/admin/users/:userId/approve', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const adminId = req.userId;
  
  // First check if the requesting user is an admin
  const checkAdminSql = "SELECT is_admin FROM users WHERE id = ?";
  db.query(checkAdminSql, [adminId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (results.length === 0 || results[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Start transaction
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ error: 'Failed to approve user' });
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          console.error('Error starting transaction:', err);
          return res.status(500).json({ error: 'Failed to approve user' });
        }

        // Log the approve action
        const actionId = uuidv4();
        connection.query(
          'INSERT INTO admin_actions (id, admin_id, user_id, action_type) VALUES (?, ?, ?, ?)',
          [actionId, adminId, userId, 'approve'],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error logging admin action:', err);
                res.status(500).json({ error: 'Failed to approve user' });
              });
            }

            // Approve the user
            connection.query(
              'UPDATE users SET is_approved = 1 WHERE id = ?',
              [userId],
              (err, result) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Error approving user:', err);
                    res.status(500).json({ error: 'Failed to approve user' });
                  });
                }

                if (result.affectedRows === 0) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(404).json({ error: 'User not found' });
                  });
                }

                // Commit the transaction
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Error committing transaction:', err);
                      res.status(500).json({ error: 'Failed to approve user' });
                    });
                  }
                  connection.release();
                  res.json({ message: 'User approved successfully' });
                });
              }
            );
          }
        );
      });
    });
  });
});

// Update make admin endpoint to log action
app.put('/api/admin/users/:userId/make-admin', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const adminId = req.userId;
  
  // First check if the requesting user is an admin
  const checkAdminSql = "SELECT is_admin FROM users WHERE id = ?";
  db.query(checkAdminSql, [adminId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (results.length === 0 || results[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Start transaction
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ error: 'Failed to make user admin' });
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          console.error('Error starting transaction:', err);
          return res.status(500).json({ error: 'Failed to make user admin' });
        }

        // Log the make admin action
        const actionId = uuidv4();
        connection.query(
          'INSERT INTO admin_actions (id, admin_id, user_id, action_type) VALUES (?, ?, ?, ?)',
          [actionId, adminId, userId, 'make_admin'],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error logging admin action:', err);
                res.status(500).json({ error: 'Failed to make user admin' });
              });
            }

            // Make the user an admin
            connection.query(
              'UPDATE users SET is_admin = 1 WHERE id = ?',
              [userId],
              (err, result) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Error making user admin:', err);
                    res.status(500).json({ error: 'Failed to make user admin' });
                  });
                }

                if (result.affectedRows === 0) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(404).json({ error: 'User not found' });
                  });
                }

                // Commit the transaction
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Error committing transaction:', err);
                      res.status(500).json({ error: 'Failed to make user admin' });
                    });
                  }
                  connection.release();
                  res.json({ message: 'User is now an admin' });
                });
              }
            );
          }
        );
      });
    });
  });
});

// Get admin actions history
app.get('/api/admin/actions', authenticateToken, (req, res) => {
  const adminId = req.userId;
  
  // First check if the requesting user is an admin
  const checkAdminSql = "SELECT is_admin FROM users WHERE id = ?";
  db.query(checkAdminSql, [adminId], (err, results) => {
    if (err) {
      console.error('Error checking admin status:', err);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (results.length === 0 || results[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Get admin actions with user details
    const sqlSelect = `
      SELECT 
        aa.id,
        aa.action_type,
        aa.action_date,
        u1.username as admin_username,
        u2.username as target_username
      FROM admin_actions aa
      JOIN users u1 ON aa.admin_id = u1.id
      JOIN users u2 ON aa.user_id = u2.id
      ORDER BY aa.action_date DESC
    `;
    
    db.query(sqlSelect, (err, results) => {
      if (err) {
        console.error('Error fetching admin actions:', err);
        return res.status(500).json({ error: 'Failed to fetch admin actions' });
      }
      res.json(results);
    });
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error("Port is already in use. Try a different one.");
  } else {
    console.error("Server error:", err);
  }
});
