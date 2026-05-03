from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import schemas, models, auth, dependencies
from ..database import get_db

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    # Check if project exists
    project = dependencies.get_project(db, task.project_id)
    
    # Check if assignee exists
    assignee = db.query(models.User).filter(models.User.id == task.assigned_to_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    
    # Create task
    db_task = models.Task(
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assigned_to_id=task.assigned_to_id,
        created_by_id=current_user.id,
        due_date=task.due_date
    )
    db.add(db_task)
    db.flush()
    
    # Create milestones
    if task.milestones:
        for milestone_data in task.milestones:
            db_milestone = models.Milestone(
                title=milestone_data.title,
                description=milestone_data.description,
                task_id=db_task.id
            )
            db.add(db_milestone)
            db.flush()
            
            # Create progress tracking for milestone
            db_progress = models.MilestoneProgress(
                milestone_id=db_milestone.id,
                member_id=task.assigned_to_id,
                progress_percentage=0,
                status=models.MilestoneStatus.NOT_DONE
            )
            db.add(db_progress)
    
    db.commit()
    db.refresh(db_task)
    
    # Manually construct response
    assignee_response = schemas.UserResponse(
        id=assignee.id,
        email=assignee.email,
        username=assignee.username,
        role=assignee.role,
        is_active=assignee.is_active,
        created_at=assignee.created_at
    )
    
    milestones_response = []
    for milestone in db_task.milestones:
        progress_response = None
        if milestone.progress:
            progress_response = schemas.MilestoneProgressResponse(
                id=milestone.progress.id,
                milestone_id=milestone.progress.milestone_id,
                member_id=milestone.progress.member_id,
                progress_percentage=milestone.progress.progress_percentage,
                status=milestone.progress.status,
                last_updated=milestone.progress.last_updated
            )
        
        milestones_response.append(schemas.MilestoneResponse(
            id=milestone.id,
            title=milestone.title,
            description=milestone.description,
            task_id=milestone.task_id,
            created_at=milestone.created_at,
            progress=progress_response
        ))
    
    return schemas.TaskResponse(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        project_id=db_task.project_id,
        assigned_to_id=db_task.assigned_to_id,
        created_by_id=db_task.created_by_id,
        created_at=db_task.created_at,
        due_date=db_task.due_date,
        assignee=assignee_response,
        milestones=milestones_response
    )

@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Task)
    
    # Filter by project if specified
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    
    # Filter by user role
    if current_user.role == models.UserRole.ADMIN:
        tasks = query.all()
    else:
        tasks = query.filter(models.Task.assigned_to_id == current_user.id).all()
    
    # Manually construct responses
    result = []
    for task in tasks:
        assignee = task.assignee
        assignee_response = schemas.UserResponse(
            id=assignee.id,
            email=assignee.email,
            username=assignee.username,
            role=assignee.role,
            is_active=assignee.is_active,
            created_at=assignee.created_at
        )
        
        milestones_response = []
        for milestone in task.milestones:
            progress_response = None
            if milestone.progress:
                progress_response = schemas.MilestoneProgressResponse(
                    id=milestone.progress.id,
                    milestone_id=milestone.progress.milestone_id,
                    member_id=milestone.progress.member_id,
                    progress_percentage=milestone.progress.progress_percentage,
                    status=milestone.progress.status,
                    last_updated=milestone.progress.last_updated
                )
            
            milestones_response.append(schemas.MilestoneResponse(
                id=milestone.id,
                title=milestone.title,
                description=milestone.description,
                task_id=milestone.task_id,
                created_at=milestone.created_at,
                progress=progress_response
            ))
        
        result.append(schemas.TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            project_id=task.project_id,
            assigned_to_id=task.assigned_to_id,
            created_by_id=task.created_by_id,
            created_at=task.created_at,
            due_date=task.due_date,
            assignee=assignee_response,
            milestones=milestones_response
        ))
    
    return result

@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = dependencies.get_task(db, task_id)
    
    if current_user.role != models.UserRole.ADMIN and task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this task")
    
    assignee = task.assignee
    assignee_response = schemas.UserResponse(
        id=assignee.id,
        email=assignee.email,
        username=assignee.username,
        role=assignee.role,
        is_active=assignee.is_active,
        created_at=assignee.created_at
    )
    
    milestones_response = []
    for milestone in task.milestones:
        progress_response = None
        if milestone.progress:
            progress_response = schemas.MilestoneProgressResponse(
                id=milestone.progress.id,
                milestone_id=milestone.progress.milestone_id,
                member_id=milestone.progress.member_id,
                progress_percentage=milestone.progress.progress_percentage,
                status=milestone.progress.status,
                last_updated=milestone.progress.last_updated
            )
        
        milestones_response.append(schemas.MilestoneResponse(
            id=milestone.id,
            title=milestone.title,
            description=milestone.description,
            task_id=milestone.task_id,
            created_at=milestone.created_at,
            progress=progress_response
        ))
    
    return schemas.TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assigned_to_id=task.assigned_to_id,
        created_by_id=task.created_by_id,
        created_at=task.created_at,
        due_date=task.due_date,
        assignee=assignee_response,
        milestones=milestones_response
    )

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    task = dependencies.get_task(db, task_id)
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.assigned_to_id is not None:
        task.assigned_to_id = task_update.assigned_to_id
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    
    db.commit()
    db.refresh(task)
    
    assignee = task.assignee
    assignee_response = schemas.UserResponse(
        id=assignee.id,
        email=assignee.email,
        username=assignee.username,
        role=assignee.role,
        is_active=assignee.is_active,
        created_at=assignee.created_at
    )
    
    milestones_response = []
    for milestone in task.milestones:
        progress_response = None
        if milestone.progress:
            progress_response = schemas.MilestoneProgressResponse(
                id=milestone.progress.id,
                milestone_id=milestone.progress.milestone_id,
                member_id=milestone.progress.member_id,
                progress_percentage=milestone.progress.progress_percentage,
                status=milestone.progress.status,
                last_updated=milestone.progress.last_updated
            )
        
        milestones_response.append(schemas.MilestoneResponse(
            id=milestone.id,
            title=milestone.title,
            description=milestone.description,
            task_id=milestone.task_id,
            created_at=milestone.created_at,
            progress=progress_response
        ))
    
    return schemas.TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assigned_to_id=task.assigned_to_id,
        created_by_id=task.created_by_id,
        created_at=task.created_at,
        due_date=task.due_date,
        assignee=assignee_response,
        milestones=milestones_response
    )

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    task = dependencies.get_task(db, task_id)
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.post("/{task_id}/milestones/{milestone_id}/progress")
def update_milestone_progress(
    task_id: int,
    milestone_id: int,
    progress_update: schemas.MilestoneProgressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    task = dependencies.get_task(db, task_id)
    milestone = dependencies.get_milestone(db, milestone_id)
    
    # Check authorization
    if current_user.role != models.UserRole.ADMIN and task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this milestone")
    
    # Get progress record
    progress = db.query(models.MilestoneProgress).filter(
        models.MilestoneProgress.milestone_id == milestone_id
    ).first()
    
    if not progress:
        raise HTTPException(status_code=404, detail="Progress record not found")
    
    # Update progress
    progress.progress_percentage = progress_update.progress_percentage
    
    # Update status based on progress
    if progress_update.progress_percentage == 0:
        progress.status = models.MilestoneStatus.NOT_DONE
    elif progress_update.progress_percentage == 100:
        progress.status = models.MilestoneStatus.COMPLETED
    else:
        progress.status = models.MilestoneStatus.WORKING
    
    progress.last_updated = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Progress updated successfully",
        "progress_percentage": progress.progress_percentage,
        "status": progress.status
    }