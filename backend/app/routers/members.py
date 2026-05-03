from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import schemas, models, auth
from ..database import get_db

router = APIRouter(prefix="/api/members", tags=["members"])

@router.get("/", response_model=List[schemas.UserResponse])
def get_all_members(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    members = db.query(models.User).filter(models.User.role == models.UserRole.MEMBER).all()
    return members

@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    # Get all tasks
    all_tasks = db.query(models.Task).all()
    total_tasks = len(all_tasks)
    
    # Calculate progress stats
    completed_tasks = 0
    in_progress_tasks = 0
    
    for task in all_tasks:
        milestones = task.milestones
        if milestones:
            avg_progress = sum(m.progress.progress_percentage for m in milestones if m.progress) / len(milestones)
            if avg_progress == 100:
                completed_tasks += 1
            elif avg_progress > 0:
                in_progress_tasks += 1
    
    # Calculate overdue tasks
    overdue_tasks = db.query(models.Task).filter(
        models.Task.due_date < datetime.utcnow()
    ).count()
    
    return schemas.DashboardStats(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        in_progress_tasks=in_progress_tasks,
        overdue_tasks=overdue_tasks
    )

@router.get("/member-tasks", response_model=List[schemas.MemberTaskSummary])
def get_member_tasks_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin_user)
):
    members = db.query(models.User).filter(models.User.role == models.UserRole.MEMBER).all()
    summaries = []
    
    for member in members:
        tasks = db.query(models.Task).filter(models.Task.assigned_to_id == member.id).all()
        task_responses = []
        total_progress = 0
        completed_milestones = 0
        total_milestones = 0
        
        for task in tasks:
            task_response = schemas.TaskResponse.model_validate(task)
            task_responses.append(task_response)
            
            for milestone in task.milestones:
                if milestone.progress:
                    total_progress += milestone.progress.progress_percentage
                    total_milestones += 1
                    if milestone.progress.progress_percentage == 100:
                        completed_milestones += 1
        
        overall_progress = total_progress / total_milestones if total_milestones > 0 else 0
        
        summaries.append(schemas.MemberTaskSummary(
            user=schemas.UserResponse.model_validate(member),
            tasks=task_responses,
            total_tasks=len(tasks),
            completed_milestones=completed_milestones,
            overall_progress=overall_progress
        ))
    
    return summaries