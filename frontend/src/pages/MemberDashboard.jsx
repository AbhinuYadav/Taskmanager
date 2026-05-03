import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, ProgressBar, Badge } from 'react-bootstrap';
import { getTasks } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
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

  const getOverallProgress = () => {
    if (tasks.length === 0) return 0;
    let totalProgress = 0;
    let totalMilestones = 0;
    tasks.forEach(task => {
      task.milestones.forEach(milestone => {
        totalProgress += milestone.progress?.progress_percentage || 0;
        totalMilestones++;
      });
    });
    return totalMilestones > 0 ? Math.round(totalProgress / totalMilestones) : 0;
  };

  const statsCards = [
    { title: 'Active Tasks', value: tasks.length, icon: FiClock, color: 'primary' },
    { title: 'Overall Progress', value: `${getOverallProgress()}%`, icon: FiTrendingUp, color: 'success' }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="bg-primary text-white rounded-3 p-4 mb-4">
        <h1 className="h3 mb-2">Welcome back! 👋</h1>
        <p className="mb-0 opacity-75">Here's your task progress overview</p>
      </div>

      <Row className="mb-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Col md={6} key={idx} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">{stat.title}</h6>
                      <h3 className="mb-0 fw-bold">{stat.value}</h3>
                    </div>
                    <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded-circle`}>
                      <Icon className={`text-${stat.color}`} size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0 fw-bold">Your Active Tasks</h5>
        </Card.Header>
        <Card.Body>
          {tasks.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No tasks assigned yet</p>
            </div>
          ) : (
            tasks.map((task) => {
              const taskProgress = task.milestones.length > 0
                ? Math.round(task.milestones.reduce((sum, m) => sum + (m.progress?.progress_percentage || 0), 0) / task.milestones.length)
                : 0;
              
              return (
                <Card key={task.id} className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{task.title}</h6>
                        <p className="text-muted small mb-2">{task.description}</p>
                        <Badge bg={taskProgress === 100 ? "success" : "primary"}>
                          {taskProgress}% Complete
                        </Badge>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                        Update →
                      </Button>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small>{taskProgress}%</small>
                      </div>
                      <ProgressBar now={taskProgress} variant={taskProgress === 100 ? "success" : "primary"} />
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MemberDashboard;