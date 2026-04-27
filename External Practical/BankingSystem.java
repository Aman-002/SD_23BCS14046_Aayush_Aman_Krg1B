import java.util.*;
public class BankingSystem {
    public static void main(String [] args){
        Scanner ob = new Scanner(System.in);
        Boolean ok = true;
        System.out.println("Enter USER ID");
        int userId = ob.nextInt(); 
        Payment pay = new Payment(userId, 0);         
        while(ok){
            System.out.println("Welcome to Banking System");
            System.out.println("Select your option");
            System.out.println("1 for Deposit");
            System.out.println("2 for Withdraw");
            System.out.println("3 to view Balance");
            System.out.println("4 to Exit");
            int ch = ob.nextInt();
            switch (ch) {
                case 1:
                        System.out.println("Enter Amount to deposit");
                        double amt = ob.nextDouble();
                        pay.deposit(amt);
                        String message = amt + "deposited to user" + userId;
                        Notification note = new Notification(userId,message);
                        note.sendNotification();
                        break;
                    case 2:                
                        System.out.println("Enter Amount to withdraw");
                        double wamt = ob.nextDouble();
                        pay.withdraw(wamt);
                        String nmessage = wamt + "deposited to user" + userId;
                        Notification note2 = new Notification(userId,nmessage);
                        note2.sendNotification();
                        break;
                    case 3:  
                        System.out.println(pay.getAmt());             
                        break;
                    case 4:  
                        ok = false;             
                        break;
                    default:
                        ok = false;
                        break;
                }
        }
        ob.close();
    }
}
class Payment{
    int userId;
    double amt;
    Payment(int userId, double amt){
        this.userId = userId;
        this.amt = amt;
    }
    void deposit(double amt){
        this.amt += amt;
    }
    void withdraw(double amt){
        this.amt -= amt;
    }
    double getAmt(){
        return amt;
    }
}
class Notification{
    int userId;
    String message;
    Notification(int userId, String message){
        this.userId = userId;
        this.message = message; 
    }
    void sendNotification(){
        System.out.println(message + "\nSent notification 202");
    }
}