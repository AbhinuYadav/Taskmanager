import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Spinner, Badge, Modal, ProgressBar } from 'react-bootstrap';
import { getMembers, getTasks } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiCalendar, FiPlusCircle, FiEye, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await getMembers();
      setMembers(response.data.filter(m => m.role === 'member'));
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberTasks = async (member) => {
    setTasksLoading(true);
    setSelectedMember(member);
    try {
      const response = await getTasks();
      const tasks = response.data.filter(task => task.assigned_to_id === member.id);
      setMemberTasks(tasks);
      setShowTasksModal(true);
    } catch (error) {
      toast.error('Failed to load member tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const getTaskProgress = (task) => {
    if (!task.milestones || task.milestones.length === 0) return 0;
    const total = task.milestones.reduce((sum, m) => sum + (m.progress?.progress_percentage || 0), 0);
    return Math.round(total / task.milestones.length);
  };

  const getStatusColor = (progress) => {
    if (progress === 100) return 'success';
    if (progress > 0) return 'warning';
    return 'secondary';
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold">Team Members</h1>
          <p className="text-muted">Manage and assign tasks to team members</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/projects')}>
          <FiPlusCircle className="me-2" /> Assign New Task
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="fw-bold">{member.username}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FiMail size={14} className="text-muted" />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td>
                    <Badge bg="info">{member.role}</Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FiCalendar size={14} className="text-muted" />
                      <span>{new Date(member.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => navigate('/projects')}
                      >
                        Give Task
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-info"
                        onClick={() => fetchMemberTasks(member)}
                      >
                        <FiEye className="me-1" /> View Tasks
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {members.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No members found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* View Tasks Modal */}
      <Modal show={showTasksModal} onHide={() => setShowTasksModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Tasks Assigned to {selectedMember?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tasksLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : memberTasks.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No tasks assigned to this member yet</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setShowTasksModal(false);
                  navigate('/projects');
                }}
              >
                Assign a task now
              </Button>
            </div>
          ) : (
            <div>
              {memberTasks.map((task) => {
                const progress = getTaskProgress(task);
                const completedMilestones = task.milestones?.filter(m => m.progress?.progress_percentage === 100).length || 0;
                const totalMilestones = task.milestones?.length || 0;
                
                return (
                  <Card key={task.id} className="mb-3 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold mb-1">{task.title}</h6>
                          <p className="text-muted small mb-2">{task.description || 'No description'}</p>
                        </div>
                        <Badge bg={getStatusColor(progress)}>
                          {progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Progress</small>
                          <small className="fw-bold">{progress}%</small>
                        </div>
                        <ProgressBar 
                          now={progress} 
                          variant={progress === 100 ? "success" : "primary"}
                          className="progress-bar"
                        />
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3">
                          <small className="text-muted">
                            <FiCheckCircle className="me-1" /> 
                            {completedMilestones}/{totalMilestones} Milestones
                          </small>
                          <small className="text-muted">
                            <FiClock className="me-1" />
                            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          </small>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => {
                            setShowTasksModal(false);
                            navigate(`/tasks/${task.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTasksModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            setShowTasksModal(false);
            navigate('/projects');
          }}>
            Assign New Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Members;