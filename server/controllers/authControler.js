import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const login = async (req, res) => {
 try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
      return res.status(404).json({success:false, message: 'User not found' });
    }    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({success:false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ Id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2d' });

    return res.status(200).json({success:true, message: 'login successful' token, user: { id: user._id, name: user.name, email: user.email, address: user.address, role: user.role } });
    } catch (error) {
        return res.status(500).json({success:false, message: 'Internal Server error' }); 
  } 
}

export { login };