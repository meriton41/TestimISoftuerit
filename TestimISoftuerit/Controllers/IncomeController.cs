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
  public class IncomeController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public IncomeController(ApplicationDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetIncomes()
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var incomes = await _context.Incomes
          .Include(i => i.Category)
          .Where(i => i.UserId == userId)
          .OrderByDescending(i => i.Date)
          .ToListAsync();

        return Ok(incomes);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetIncome(int id)
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var income = await _context.Incomes
          .Include(i => i.Category)
          .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (income == null)
          return NotFound();

        return Ok(income);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPost]
    public async Task<IActionResult> CreateIncome([FromBody] Income income)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        // Validate category if provided
        if (income.CategoryId.HasValue)
        {
          var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == income.CategoryId.Value &&
              (c.UserId == null || c.UserId == userId));

          if (category == null)
            return BadRequest("Invalid category");
        }

        // Set user information
        income.UserId = userId;
        income.User = await _context.Users.FindAsync(userId);

        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIncome), new { id = income.Id }, income);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIncome(int id, [FromBody] Income income)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var existingIncome = await _context.Incomes
          .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (existingIncome == null)
          return NotFound();

        // Validate category if provided
        if (income.CategoryId.HasValue)
        {
          var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == income.CategoryId.Value &&
              (c.UserId == null || c.UserId == userId));

          if (category == null)
            return BadRequest("Invalid category");
        }

        existingIncome.Source = income.Source;
        existingIncome.Amount = income.Amount;
        existingIncome.Date = income.Date;
        existingIncome.CategoryId = income.CategoryId;
        existingIncome.Description = income.Description;

        await _context.SaveChangesAsync();
        return Ok(existingIncome);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIncome(int id)
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var income = await _context.Incomes
          .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (income == null)
          return NotFound();

        _context.Incomes.Remove(income);
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