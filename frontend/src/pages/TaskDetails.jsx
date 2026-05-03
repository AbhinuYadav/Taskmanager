import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, ProgressBar, Badge, Spinner, Form, Row, Col } from 'react-bootstrap';
import { getTask, updateMilestoneProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiUser, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TaskDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sliderValues, setSliderValues] = useState({});

  const fetchTask = useCallback(async () => {
    try {
      const response = await getTask(id);
      setTask(response.data);
      const initialValues = {};
      response.data.milestones.forEach(milestone => {
        initialValues[milestone.id] = milestone.progress?.progress_percentage || 0;
      });
      setSliderValues(initialValues);
    } catch (error) {
      toast.error('Failed to load task');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleProgressUpdate = async (milestoneId, progress) => {
    setUpdating(true);
    try {
      await updateMilestoneProgress(id, milestoneId, progress);
      setSliderValues(prev => ({ ...prev, [milestoneId]: progress }));
      toast.success(`Progress updated to ${progress}%`);
      fetchTask();
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <Badge bg="success" className="px-3 py-2">✅ Completed</Badge>;
      case 'working':
        return <Badge bg="warning" className="px-3 py-2">🟡 In Progress</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2">⚪ Not Started</Badge>;
    }
  };

  const getOverallProgress = () => {
    if (!task || task.milestones.length === 0) return 0;
    const total = task.milestones.reduce((sum, m) => sum + (m.progress?.progress_percentage || 0), 0);
    return Math.round(total / task.milestones.length);
  };

  const getCompletedCount = () => {
    return task?.milestones.filter(m => m.progress?.progress_percentage === 100).length || 0;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const completedCount = getCompletedCount();
  const isAssigned = task?.assigned_to_id === user?.id;
  const canUpdate = user?.role === 'member' && isAssigned;

  return (
    <Container fluid className="py-4">
      <Button 
        variant="link" 
        onClick={() => navigate(-1)}
        className="mb-3 text-decoration-none"
      >
        <FiArrowLeft /> Back
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="fw-bold mb-2">{task.title}</h2>
                  <p className="text-muted">{task.description || 'No description provided'}</p>
                </div>
                <div className="text-end">
                  <Badge bg={overallProgress === 100 ? "success" : "info"} className="mb-2" style={{ fontSize: '14px' }}>
                    {overallProgress}% Complete
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">Overall Progress</small>
                  <small className="fw-bold text-primary">{overallProgress}%</small>
                </div>
                <ProgressBar 
                  now={overallProgress} 
                  variant={overallProgress === 100 ? "success" : "primary"}
                  className="progress-bar"
                  style={{ height: '10px' }}
                />
              </div>

              <hr />
              
              <div className="d-flex gap-4 flex-wrap">
                <div>
                  <small className="text-muted d-block">Assigned to</small>
                  <strong><FiUser className="me-1" /> {task.assignee?.username}</strong>
                </div>
                <div>
                  <small className="text-muted d-block">Due Date</small>
                  <strong><FiCalendar className="me-1" /> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</strong>
                </div>
                <div>
                  <small className="text-muted d-block">Milestones</small>
                  <strong><FiCheckCircle className="me-1" /> {completedCount}/{task.milestones.length} Completed</strong>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">🎯 Milestones</h5>
            </Card.Header>
            <Card.Body>
              {task.milestones.map((milestone, index) => {
                const progress = milestone.progress?.progress_percentage || 0;
                const status = milestone.progress?.status || 'not_done';
                
                return (
                  <div key={milestone.id} className="mb-4 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="mb-1">
                          <span className="text-primary me-2">{index + 1}.</span>
                          {milestone.title}
                        </h6>
                        {milestone.description && (
                          <small className="text-muted">{milestone.description}</small>
                        )}
                      </div>
                      {getStatusBadge(status)}
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small className="fw-bold">{progress}%</small>
                      </div>
                      <ProgressBar 
                        now={progress} 
                        variant={progress === 100 ? "success" : progress > 0 ? "warning" : "secondary"}
                        className="progress-bar"
                      />
                    </div>
                    
                    {canUpdate && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <Form.Label className="fw-bold mb-2">
                          <FiClock className="me-1" /> Update Your Progress
                        </Form.Label>
                        <div className="d-flex flex-wrap gap-3 align-items-center">
                          <div className="flex-grow-1">
                            <Form.Range
                              min="0"
                              max="100"
                              step="5"
                              value={sliderValues[milestone.id] || progress}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value);
                                setSliderValues(prev => ({ ...prev, [milestone.id]: newValue }));
                              }}
                              disabled={updating}
                              className="w-100"
                            />
                          </div>
                          <div className="d-flex gap-2">
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: '80px' }}
                              min="0"
                              max="100"
                              value={sliderValues[milestone.id] || progress}
                              onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val)) val = 0;
                                if (val < 0) val = 0;
                                if (val > 100) val = 100;
                                setSliderValues(prev => ({ ...prev, [milestone.id]: val }));
                              }}
                              disabled={updating}
                            />
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleProgressUpdate(milestone.id, sliderValues[milestone.id] || progress)}
                              disabled={updating}
                            >
                              {updating ? 'Updating...' : 'Update'}
                            </Button>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <Button size="sm" variant="outline-secondary" onClick={() => handleProgressUpdate(milestone.id, 0)}>0%</Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => handleProgressUpdate(milestone.id, 25)}>25%</Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => handleProgressUpdate(milestone.id, 50)}>50%</Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => handleProgressUpdate(milestone.id, 75)}>75%</Button>
                          <Button size="sm" variant="outline-success" onClick={() => handleProgressUpdate(milestone.id, 100)}>100%</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {!canUpdate && user?.role === 'member' && (
                <div className="alert alert-info mt-3">
                  You are assigned to this task. Use the sliders above to update your progress!
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">📊 Quick Stats</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div className="display-4 fw-bold text-primary">{overallProgress}%</div>
                <small className="text-muted">Overall Completion</small>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Total Milestones:</span>
                <strong>{task.milestones.length}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Completed:</span>
                <strong className="text-success">{completedCount}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>In Progress:</span>
                <strong className="text-warning">{task.milestones.filter(m => m.progress?.progress_percentage > 0 && m.progress?.progress_percentage < 100).length}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TaskDetails;