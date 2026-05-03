import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, ProgressBar, Badge } from 'react-bootstrap';
import { getTasks } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold">My Tasks</h1>
        <p className="text-muted">View and update your assigned tasks</p>
      </div>

      {tasks.length === 0 ? (
        <Card className="shadow-sm text-center">
          <Card.Body className="py-5">
            <p className="text-muted mb-0">No tasks assigned yet</p>
          </Card.Body>
        </Card>
      ) : (
        tasks.map((task) => {
          const taskProgress = task.milestones?.length > 0
            ? Math.round(task.milestones.reduce((sum, m) => sum + (m.progress?.progress_percentage || 0), 0) / task.milestones.length)
            : 0;
          
          return (
            <Card key={task.id} className="shadow-sm mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-2">{task.title}</h5>
                    <p className="text-muted mb-3">{task.description}</p>
                    <div className="d-flex flex-wrap gap-3 mb-3">
                      <small className="text-muted d-flex align-items-center gap-1">
                        <FiCalendar /> Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </small>
                      <Badge bg={taskProgress === 100 ? "success" : "primary"}>
                        {taskProgress}% Complete
                      </Badge>
                      <small className="text-muted">
                        📋 {task.milestones?.filter(m => m.progress?.progress_percentage === 100).length || 0}/{task.milestones?.length || 0} Milestones
                      </small>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between mb-1">
                        <small>Overall Progress</small>
                        <small>{taskProgress}%</small>
                      </div>
                      <ProgressBar 
                        now={taskProgress} 
                        variant={taskProgress === 100 ? "success" : "primary"}
                        className="progress-bar"
                      />
                    </div>
                  </div>
                  <Button 
                    variant="primary"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="ms-3"
                  >
                    Update <FiArrowRight />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          );
        })
      )}
    </Container>
  );
};

export default MyTasks;