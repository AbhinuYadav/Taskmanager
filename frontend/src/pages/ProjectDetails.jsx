import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, ProgressBar, Badge, Row, Col, Modal, Form, Alert } from 'react-bootstrap';
import { getProject, getTasks, getMembers, createTask } from '../services/api';
import { FiArrowLeft, FiCalendar, FiUsers, FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Helper function to get default due date (30 days from now)
const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to_id: '',
    due_date: getDefaultDueDate(),
    milestones: [{ title: '', description: '' }]
  });

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        getProject(id),
        getTasks(id),
        getMembers()
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data.filter(m => m.role === 'member'));
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMilestone = () => {
    setNewTask({
      ...newTask,
      milestones: [...newTask.milestones, { title: '', description: '' }]
    });
  };

  const handleRemoveMilestone = (index) => {
    const updatedMilestones = newTask.milestones.filter((_, i) => i !== index);
    setNewTask({ ...newTask, milestones: updatedMilestones });
  };

  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...newTask.milestones];
    updatedMilestones[index][field] = value;
    setNewTask({ ...newTask, milestones: updatedMilestones });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMessage('');
    
    // Validation
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      setCreating(false);
      return;
    }
    
    if (!newTask.assigned_to_id) {
      toast.error('Please select a member to assign');
      setCreating(false);
      return;
    }
    
    const validMilestones = newTask.milestones.filter(m => m.title && m.title.trim() !== '');
    if (validMilestones.length === 0) {
      toast.error('Please add at least one milestone with a title');
      setCreating(false);
      return;
    }
    
    // Format the date - ALWAYS send a valid due_date
    let formattedDueDate;
    if (newTask.due_date) {
      formattedDueDate = new Date(newTask.due_date).toISOString();
    } else {
      // Fallback: 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      formattedDueDate = defaultDate.toISOString();
    }
    
    const taskData = {
      title: newTask.title,
      description: newTask.description || "",
      project_id: parseInt(id),
      assigned_to_id: parseInt(newTask.assigned_to_id),
      due_date: formattedDueDate,
      milestones: validMilestones.map(m => ({
        title: m.title,
        description: m.description || ""
      }))
    };
    
    console.log('Sending task data:', JSON.stringify(taskData, null, 2));
    
    try {
      const response = await createTask(taskData);
      console.log('Success:', response.data);
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        assigned_to_id: '',
        due_date: getDefaultDueDate(),
        milestones: [{ title: '', description: '' }]
      });
      fetchData();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          setErrorMessage(detail);
          toast.error(detail);
        } else if (Array.isArray(detail)) {
          const messages = detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join('\n');
          setErrorMessage(messages);
          toast.error('Validation error. Check console for details.');
        } else if (typeof detail === 'object') {
          setErrorMessage(JSON.stringify(detail));
          toast.error('Server error. Check console.');
        }
      } else {
        setErrorMessage(error.message || 'Failed to create task');
        toast.error('Failed to create task');
      }
    } finally {
      setCreating(false);
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
      <Button 
        variant="link" 
        onClick={() => navigate('/projects')}
        className="mb-3 text-decoration-none"
      >
        <FiArrowLeft /> Back to Projects
      </Button>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h2 fw-bold mb-2">{project.name}</h1>
              <p className="text-muted">{project.description || 'No description provided'}</p>
              <div className="d-flex gap-3 mt-3">
                <small className="text-muted">
                  <FiCalendar className="me-1" /> Created: {new Date(project.created_at).toLocaleDateString()}
                </small>
                <small className="text-muted">
                  <FiUsers className="me-1" /> Created by: {project.creator?.username}
                </small>
              </div>
            </div>
            <Button variant="primary" onClick={() => setShowTaskModal(true)}>
              <FiPlus className="me-2" /> Add Task
            </Button>
          </div>
        </Card.Body>
      </Card>

      <h3 className="h4 mb-3">Tasks ({tasks.length})</h3>
      
      {tasks.length === 0 ? (
        <Card className="shadow-sm text-center">
          <Card.Body className="py-5">
            <p className="text-muted mb-0">No tasks in this project yet</p>
            <Button variant="link" onClick={() => setShowTaskModal(true)}>Create your first task</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {tasks.map((task) => {
            const taskProgress = task.milestones?.length > 0
              ? Math.round(task.milestones.reduce((sum, m) => sum + (m.progress?.progress_percentage || 0), 0) / task.milestones.length)
              : 0;
            
            return (
              <Col md={6} lg={4} key={task.id} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{task.title}</h6>
                      <Badge bg={taskProgress === 100 ? "success" : "primary"}>
                        {taskProgress}%
                      </Badge>
                    </div>
                    <p className="small text-muted mb-3">{task.description || 'No description'}</p>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small>{taskProgress}%</small>
                      </div>
                      <ProgressBar 
                        now={taskProgress} 
                        variant={taskProgress === 100 ? "success" : "primary"}
                        className="progress-bar"
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">
                          <FiUsers className="me-1" /> {task.assignee?.username}
                        </small>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <FiEye className="me-1" /> View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create Task Modal */}
      <Modal show={showTaskModal} onHide={() => {
        setShowTaskModal(false);
        setErrorMessage('');
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Task to "{project?.name}"</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTask}>
          <Modal.Body>
            {errorMessage && (
              <Alert variant="danger" className="mb-3">
                <strong>Error:</strong>
                <pre className="mb-0 mt-2 small">{errorMessage}</pre>
              </Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Task Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assign To <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={newTask.assigned_to_id}
                onChange={(e) => setNewTask({ ...newTask, assigned_to_id: e.target.value })}
                required
              >
                <option value="">Select a member</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.username} ({member.email})</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
              <Form.Text className="text-muted">
                Leave empty to set default (30 days from now)
              </Form.Text>
            </Form.Group>

            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Milestones <span className="text-danger">*</span></h6>
              <Button variant="outline-primary" size="sm" onClick={handleAddMilestone}>
                <FiPlus /> Add Milestone
              </Button>
            </div>
            <p className="text-muted small mb-3">Milestones help break down tasks and track progress (0-100%)</p>

            {newTask.milestones.map((milestone, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <strong>Milestone {index + 1}</strong>
                  {index > 0 && (
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleRemoveMilestone(index)}>
                      Remove
                    </Button>
                  )}
                </div>
                <Form.Group className="mb-2">
                  <Form.Label>Title {index === 0 && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Design Database Schema"
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Create User and Session tables"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                  />
                </Form.Group>
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Creating Task...' : 'Create Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProjectDetails;