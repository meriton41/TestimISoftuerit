using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedClassLibrary.Models;
using TestimISoftuerit.Data;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace TestimISoftuerit.Controllers
{
  [Authorize]
  [Route("api/[controller]")]
  [ApiController]
  public class ExpenseController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public ExpenseController(ApplicationDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetExpenses()
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var expenses = await _context.Expenses
          .Include(e => e.Category)
          .Where(e => e.UserId == userId)
          .OrderByDescending(e => e.Date)
          .ToListAsync();

        return Ok(expenses);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExpense(int id)
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var expense = await _context.Expenses
          .Include(e => e.Category)
          .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense == null)
          return NotFound();

        return Ok(expense);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPost]
    public async Task<IActionResult> CreateExpense([FromBody] Expense expense)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        // Validate category if provided
        if (expense.CategoryId.HasValue)
        {
          var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == expense.CategoryId.Value &&
              (c.UserId == null || c.UserId == userId));

          if (category == null)
            return BadRequest("Invalid category");
        }

        // Set user information
        expense.UserId = userId;
        expense.User = await _context.Users.FindAsync(userId);

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(int id, [FromBody] Expense expense)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var existingExpense = await _context.Expenses
          .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (existingExpense == null)
          return NotFound();

        // Validate category if provided
        if (expense.CategoryId.HasValue)
        {
          var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == expense.CategoryId.Value &&
              (c.UserId == null || c.UserId == userId));

          if (category == null)
            return BadRequest("Invalid category");
        }

        existingExpense.Vendor = expense.Vendor;
        existingExpense.Amount = expense.Amount;
        existingExpense.Date = expense.Date;
        existingExpense.CategoryId = expense.CategoryId;
        existingExpense.Description = expense.Description;

        await _context.SaveChangesAsync();
        return Ok(existingExpense);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var expense = await _context.Expenses
          .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense == null)
          return NotFound();

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return Ok();
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }
  }
}