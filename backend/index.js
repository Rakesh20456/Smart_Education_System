const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const LoginModel = require('./models/LoginModel');
const ProfileModel = require('./models/ProfileModel');
const GeneratedContent = require('./models/GeneratedContent');
const LearningModel = require('./models/LearningModel');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/Crud';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

app.get('/getData',(req, res) => {
    const email = req.query.email;
    ProfileModel.findOne({email: email})
        .then(user =>res.json(user))
        .catch(err => res.json(err))
});

app.post('/getSignup', (req, res) => {
    const { name, email, password } = req.body;
    LoginModel.create({ name, email, password })
        .then(login => {
            return ProfileModel.create({ name, email });
        })
        .then(user => res.json(user))
        .catch(err => res.json(err));
});

app.post('/mcqdata', async (req, res) => {
    const { email, programming, points } = req.body;
    try {
        const user = await ProfileModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let programExists = false;
        let updatedPrograms = user.programs.map((program) => {
            if (program.programming === programming) {
                programExists = true;
                return {
                    ...program,
                    count: program.count + 1,
                };
            }
            return program;
        });

        if (!programExists) {
            updatedPrograms.push({
                programming: programming,
                count: 1,
            });
        }

        const updatedPoints = user.points + points;
        const updatedUser = await ProfileModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    programs: updatedPrograms,
                    points: updatedPoints     
                }
            },
            { new: true }
        );

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error });
    }
});

app.post('/getLogin', (req, res) => {
    const { email, password } = req.body;
    LoginModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("Success");
                } else {
                    res.json("The Password is incorrect");
                }
            } else {
                res.json("No record exists");
            }
        })
        .catch(err => res.json(err));
});

app.post('/addLearningData', async (req, res) => {
    try {
        const { userName, level, categoryData } = req.body;

        const learningData = new LearningModel({
            userName,
            level,
            categoryData: categoryData,
        });
        console.log(learningData);

        await learningData.save();
        res.status(200).send({ message: 'Data added successfully', learningData });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error adding data to the database' });
    }
});

app.get('/learning', async (req, res) => {
    try {
      const userName = req.query.userName;
      const learningMaterial = await LearningModel.findOne({ userName: userName });
      const categoryDataObj = Object.fromEntries(learningMaterial.categoryData);
  
      if (!learningMaterial) {
        return res.status(404).json({ message: 'Learning material not found for this username' });
      }
      res.json({ content: categoryDataObj});
    } catch (error) {
      console.error('Error fetching learning material:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

app.get('/generated-content', async (req, res) => {
  const title = req.query.title;
  console.log(title);
  try {
    const generatedcontent = await GeneratedContent.findOne({ title: title });

    res.json({
      title: title,
      content: generatedcontent.content
    });
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ error: "Error fetching content from the database" });
  }
});
  
  
app.post('/store-generated-content', async (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: "Title or content is missing" });
  }

  try {
    const newContent = new GeneratedContent({ title, content });
    await newContent.save();

    res.json({ message: "Content saved successfully!" });
  } catch (err) {
    console.error("Error adding data to the database:", err);
    res.status(500).json({ error: 'Error adding data to the database' });
  }
});

app.listen(3005, () => {
    console.log('Server is Running');
});