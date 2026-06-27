const prisma = require('../config/database');

class OnboardingController {
    // 1. Get Onboarding Status
    async getStatus(req, res) {
        try {
            const userId = req.user.id;
            
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    onboardingStep: true,
                    onboardingCompleted: true,
                    role: true,
                    isVerified: true
                }
            });
            
            const steps = await prisma.onboardingTracking.findMany({
                where: { userId: userId },
                orderBy: { stepNumber: 'asc' }
            });
            
            // Get profile completion percentage
            const completionPercentage = await this.getProfileCompletion(userId);
            
            return res.json({
                success: true,
                data: {
                    current_step: user.onboardingStep,
                    is_completed: user.onboardingCompleted,
                    role: user.role,
                    is_verified: user.isVerified,
                    completion_percentage: completionPercentage,
                    steps: steps.map(s => ({
                        step: s.stepNumber,
                        name: s.stepName,
                        status: s.stepStatus,
                        completed_at: s.completedAt,
                        time_spent: s.timeSpentSeconds
                    })),
                    next_steps: this.getNextSteps(user, steps)
                }
            });
        } catch (error) {
            console.error('Error getting onboarding status:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get onboarding status'
            });
        }
    }
    
    // 2. Complete Onboarding Step
    async completeStep(req, res) {
        try {
            const userId = req.user.id;
            const { stepNumber, stepData } = req.body;
            
            // Get current step
            const currentStep = await prisma.onboardingTracking.findFirst({
                where: {
                    userId: userId,
                    stepNumber: stepNumber
                }
            });
            
            let trackingId;
            if (!currentStep) {
                // Create step if not exists
                const created = await prisma.onboardingTracking.create({
                    data: {
                        userId: userId,
                        stepNumber: stepNumber,
                        stepName: this.getStepName(stepNumber),
                        stepStatus: 'in_progress'
                    }
                });
                trackingId = created.id;
            } else {
                trackingId = currentStep.id;
            }
            
            // Update step
            const updated = await prisma.onboardingTracking.update({
                where: { id: trackingId },
                data: {
                    stepStatus: 'completed',
                    completedAt: new Date(),
                    timeSpentSeconds: stepData?.timeSpent || 0,
                    metadata: stepData?.metadata || {}
                }
            });
            
            // Update user's onboarding step
            await prisma.user.update({
                where: { id: userId },
                data: {
                    onboardingStep: stepNumber
                }
            });
            
            // Check if onboarding is complete
            const totalSteps = 5; // Number of onboarding steps
            const completedSteps = await prisma.onboardingTracking.count({
                where: {
                    userId: userId,
                    stepStatus: 'completed'
                }
            });
            
            if (completedSteps >= totalSteps) {
                await this.completeOnboardingInternal(userId);
            }
            
            return res.json({
                success: true,
                message: `Step ${stepNumber} completed`,
                data: updated
            });
        } catch (error) {
            console.error('Error completing step:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to complete step'
            });
        }
    }
    
    // 3. Complete Onboarding Manual call
    async completeOnboarding(req, res) {
        try {
            const userId = req.user.id;
            const data = await this.completeOnboardingInternal(userId);
            return res.json({
                success: true,
                message: 'Onboarding completed successfully!',
                data
            });
        } catch (error) {
            console.error('Error completing onboarding:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to complete onboarding'
            });
        }
    }

    async completeOnboardingInternal(userId) {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    onboardingCompleted: true,
                    onboardingStep: 5,
                    accountStatus: 'active'
                }
            }),
            prisma.welcomeExperience.create({
                data: {
                    userId: userId,
                    welcomedAt: new Date()
                }
            }),
            // Create user analytics record
            prisma.userAnalytics.upsert({
                where: {
                    userId_date: {
                        userId: userId,
                        date: new Date()
                    }
                },
                update: {
                    engagementScore: { increment: 10 },
                    activityScore: { increment: 10 },
                    socialScore: { increment: 5 }
                },
                create: {
                    userId: userId,
                    date: new Date(),
                    engagementScore: 10,
                    activityScore: 10,
                    socialScore: 5
                }
            })
        ]);
        
        // Create loyalty points
        await prisma.loyaltyPoint.create({
            data: {
                userId: userId,
                points: 50,
                totalEarned: 50,
                tier: 'bronze'
            }
        });
        
        return {
            welcome_bonus: 50,
            referral_code: await this.generateReferralCode(userId)
        };
    }
    
    // 4. Get Next Steps
    getNextSteps(user, steps) {
        const allSteps = [
            { step: 1, name: 'Create Profile' },
            { step: 2, name: 'Add Photos' },
            { step: 3, name: 'Set Availability' },
            { step: 4, name: 'Verify Identity' },
            { step: 5, name: 'Complete Profile' }
        ];
        
        const completedSteps = steps.filter(s => s.stepStatus === 'completed')
            .map(s => s.stepNumber);
        
        return allSteps.filter(s => !completedSteps.includes(s.step));
    }
    
    // 5. Get Profile Completion Percentage
    async getProfileCompletion(userId) {
        const profile = await prisma.profile.findUnique({
            where: { userId: userId }
        });
        
        if (!profile) return 0;
        
        const checks = {
            has_title: !!profile.title,
            has_bio: !!profile.bio && profile.bio.length > 50,
            has_photo: profile.images && profile.images.length > 0,
            has_price: !!profile.pricePerHour,
            has_availability: profile.availability && Object.keys(profile.availability).length > 0,
            has_tags: profile.tags && profile.tags.length > 0,
            has_languages: profile.languages && profile.languages.length > 0,
            has_specialties: profile.specialties && profile.specialties.length > 0,
            has_gallery: profile.images && profile.images.length >= 3,
            is_verified: profile.verified
        };
        
        const completed = Object.values(checks).filter(Boolean).length;
        const total = Object.keys(checks).length;
        
        return Math.round((completed / total) * 100);
    }

    getStepName(stepNumber) {
        const names = ['Create Profile', 'Add Photos', 'Set Availability', 'Verify Identity', 'Complete Profile'];
        return names[stepNumber - 1] || `Step ${stepNumber}`;
    }

    async generateReferralCode(userId) {
        return `JIGO-${userId.substring(0,6).toUpperCase()}`;
    }
}

module.exports = new OnboardingController();
